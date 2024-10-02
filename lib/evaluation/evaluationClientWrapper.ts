import { JSONPath as jp } from '@astronautlabs/jsonpath';
import { Descriptor, Format, InputDescriptorV1, InputDescriptorV2, PresentationSubmission, Rules } from '@sphereon/pex-models';
import type { SubmissionRequirement } from '@sphereon/pex-models';
import {
  CredentialMapper,
  IVerifiableCredential,
  IVerifiablePresentation,
  OriginalVerifiableCredential,
  SdJwtDecodedVerifiableCredential,
  WrappedVerifiableCredential,
  WrappedVerifiablePresentation,
} from '@sphereon/ssi-types';

import { Checked, Status } from '../ConstraintUtils';
import { PresentationSubmissionLocation } from '../signing';
import {
  IInternalPresentationDefinition,
  InternalPresentationDefinitionV1,
  InternalPresentationDefinitionV2,
  IPresentationDefinition,
  OrArray,
} from '../types';
import { JsonPathUtils, ObjectUtils } from '../utils';
import { getVpFormatForVcFormat } from '../utils/formatMap';

import {
  EvaluationResults,
  HandlerCheckResult,
  PresentationEvaluationResults,
  SelectResults,
  SubmissionRequirementMatch,
  SubmissionRequirementMatchType,
} from './core';
import { EvaluationClient } from './evaluationClient';

interface SubmissionSatisfiesSubmissionRequirementResult {
  isSubmissionRequirementSatisfied: boolean;
  totalMatches: number;
  minRequiredMatches?: number;
  totalRequiredMatches?: number;
  maxRequiredMatches?: number;

  errors: string[];

  nested?: SubmissionSatisfiesSubmissionRequirementResult[];
}

interface SubmissionSatisfiesDefinitionResult {
  doesSubmissionSatisfyDefinition: boolean;
  error?: string;
  totalMatches: number;
  totalRequiredMatches: number;

  /**
   * Only populated if submission requirements are present
   */
  submisisonRequirementResults?: SubmissionSatisfiesSubmissionRequirementResult[];
}

export class EvaluationClientWrapper {
  private _client: EvaluationClient;

  constructor() {
    this._client = new EvaluationClient();
  }

  public getEvaluationClient() {
    return this._client;
  }

  public selectFrom(
    presentationDefinition: IInternalPresentationDefinition,
    wrappedVerifiableCredentials: WrappedVerifiableCredential[],
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
    },
  ): SelectResults {
    let selectResults: SelectResults;

    this._client.evaluate(presentationDefinition, wrappedVerifiableCredentials, opts);
    const warnings: Checked[] = [...this.formatNotInfo(Status.WARN)];
    const errors: Checked[] = [...this.formatNotInfo(Status.ERROR)];

    if (presentationDefinition.submission_requirements) {
      const info: HandlerCheckResult[] = this._client.results.filter(
        (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR,
      );
      const marked = Array.from(new Set(info));
      let matchSubmissionRequirements;
      try {
        matchSubmissionRequirements = this.matchSubmissionRequirements(
          presentationDefinition,
          presentationDefinition.submission_requirements,
          marked,
        );
      } catch (e) {
        const matchingError: Checked = {
          status: Status.ERROR,
          message: JSON.stringify(e),
          tag: 'matchSubmissionRequirements',
        };
        return {
          errors: errors ? [...errors, matchingError] : [matchingError],
          warnings: warnings,
          areRequiredCredentialsPresent: Status.ERROR,
        };
      }

      const matches = this.extractMatches(matchSubmissionRequirements);
      const credentials: IVerifiableCredential[] = matches.map(
        (e) =>
          jp.nodes(
            this._client.wrappedVcs.map((wrapped) => wrapped.original),
            e,
          )[0].value,
      );
      const areRequiredCredentialsPresent = this.determineAreRequiredCredentialsPresent(presentationDefinition, matchSubmissionRequirements);
      selectResults = {
        errors: areRequiredCredentialsPresent === Status.INFO ? [] : errors,
        matches: [...matchSubmissionRequirements],
        areRequiredCredentialsPresent,
        verifiableCredential: credentials,
        warnings,
      };
    } else {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== Status.ERROR,
      );
      const checkWithoutSRResults: HandlerCheckResult[] = this.checkWithoutSubmissionRequirements(marked, presentationDefinition);
      if (!checkWithoutSRResults.length) {
        const matchSubmissionRequirements = this.matchWithoutSubmissionRequirements(marked, presentationDefinition);
        const matches = this.extractMatches(matchSubmissionRequirements);
        const credentials: IVerifiableCredential[] = matches.map(
          (e) =>
            jp.nodes(
              this._client.wrappedVcs.map((wrapped) => wrapped.original),
              e,
            )[0].value,
        );
        selectResults = {
          errors: [],
          matches: [...matchSubmissionRequirements],
          areRequiredCredentialsPresent: Status.INFO,
          verifiableCredential: credentials,
          warnings,
        };
      } else {
        return {
          errors: errors,
          matches: [],
          areRequiredCredentialsPresent: Status.ERROR,
          verifiableCredential: wrappedVerifiableCredentials.map((value) => value.original),
          warnings: warnings,
        };
      }
    }

    this.fillSelectableCredentialsToVerifiableCredentialsMapping(selectResults, wrappedVerifiableCredentials);
    selectResults.areRequiredCredentialsPresent = this.determineAreRequiredCredentialsPresent(presentationDefinition, selectResults?.matches);
    this.remapMatches(
      wrappedVerifiableCredentials.map((wrapped) => wrapped.original as IVerifiableCredential),
      selectResults.matches,
      selectResults?.verifiableCredential,
    );
    selectResults.matches?.forEach((m) => {
      this.updateSubmissionRequirementMatchPathToAlias(m, 'verifiableCredential');
    });
    if (selectResults.areRequiredCredentialsPresent === Status.INFO) {
      selectResults.errors = [];
    } else {
      selectResults.errors = errors;
      selectResults.warnings = warnings;
      selectResults.verifiableCredential = wrappedVerifiableCredentials.map((value) => value.original);
    }
    return selectResults;
  }

  private remapMatches(
    verifiableCredentials: OriginalVerifiableCredential[],
    submissionRequirementMatches?: SubmissionRequirementMatch[],
    vcsToSend?: OriginalVerifiableCredential[],
  ) {
    submissionRequirementMatches?.forEach((srm) => {
      if (srm.from_nested) {
        this.remapMatches(verifiableCredentials, srm.from_nested, vcsToSend);
      } else {
        srm.vc_path.forEach((match, index, matches) => {
          const vc = jp.query(verifiableCredentials, match)[0];
          const newIndex = vcsToSend?.findIndex((svc) => JSON.stringify(svc) === JSON.stringify(vc));
          if (newIndex === -1) {
            throw new Error(
              `The index of the VerifiableCredential in your current call can't be found in your previously submitted credentials. Are you trying to send a new Credential?\nverifiableCredential: ${vc}`,
            );
          }
          matches[index] = `$[${newIndex}]`;
        });
        srm.name;
      }
    });
  }

  private extractMatches(matchSubmissionRequirements: SubmissionRequirementMatch[]): string[] {
    const matches: string[] = [];
    matchSubmissionRequirements.forEach((e) => {
      matches.push(...e.vc_path);
      if (e.from_nested) {
        matches.push(...this.extractMatches(e.from_nested));
      }
    });
    return Array.from(new Set(matches));
  }

  /**
   * Since this is without SubmissionRequirements object, each InputDescriptor has to have at least one corresponding VerifiableCredential
   * @param marked: info logs for `MarkForSubmissionEvaluation` handler
   * @param pd
   * @private
   */
  private checkWithoutSubmissionRequirements(marked: HandlerCheckResult[], pd: IInternalPresentationDefinition): HandlerCheckResult[] {
    const checkResult: HandlerCheckResult[] = [];
    if (!(pd as InternalPresentationDefinitionV2).input_descriptors) {
      return [];
    }
    if (!marked.length) {
      return [
        {
          input_descriptor_path: '',
          evaluator: 'checkWithoutSubmissionRequirement',
          verifiable_credential_path: '',
          status: Status.ERROR,
          payload: `Not all the InputDescriptors are addressed`,
        },
      ];
    }
    const inputDescriptors = (pd as InternalPresentationDefinitionV2).input_descriptors;
    const markedInputDescriptorPaths: string[] = ObjectUtils.getDistinctFieldInObject(marked, 'input_descriptor_path') as string[];
    if (markedInputDescriptorPaths.length !== inputDescriptors.length) {
      const inputDescriptorsFromLogs = (
        markedInputDescriptorPaths.map((value) => JsonPathUtils.extractInputField(pd, [value])[0].value) as InputDescriptorV2[]
      ).map((value) => value.id);
      for (let i = 0; i < (pd as InternalPresentationDefinitionV2).input_descriptors.length; i++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (inputDescriptorsFromLogs.indexOf((pd as InternalPresentationDefinitionV2).input_descriptors[i].id) == -1) {
          checkResult.push({
            input_descriptor_path: `$.input_descriptors[${i}]`,
            evaluator: 'checkWithoutSubmissionRequirement',
            verifiable_credential_path: '',
            status: Status.ERROR,
            payload: `Not all the InputDescriptors are addressed`,
          });
        }
      }
    }
    return checkResult;
  }

  private matchSubmissionRequirements(
    pd: IInternalPresentationDefinition,
    submissionRequirements: SubmissionRequirement[],
    marked: HandlerCheckResult[],
  ): SubmissionRequirementMatch[] {
    const submissionRequirementMatches: SubmissionRequirementMatch[] = [];
    for (const [srIndex, sr] of Object.entries(submissionRequirements)) {
      // Create a default SubmissionRequirementMatch object
      const srm: SubmissionRequirementMatch = {
        rule: sr.rule,
        vc_path: [],

        name: sr.name,
        type: SubmissionRequirementMatchType.SubmissionRequirement,
        id: Number(srIndex),
      };

      if (sr.from) {
        srm.from = sr.from;
      }
      // Assign min, max, and count regardless of 'from' or 'from_nested'
      sr.min ? (srm.min = sr.min) : undefined;
      sr.max ? (srm.max = sr.max) : undefined;
      sr.count ? (srm.count = sr.count) : undefined;

      if (sr.from) {
        const matchingVcPaths = this.getMatchingVcPathsForSubmissionRequirement(pd, sr, marked);
        srm.vc_path.push(...matchingVcPaths);
        submissionRequirementMatches.push(srm);
      } else if (sr.from_nested) {
        // Recursive call to matchSubmissionRequirements for nested requirements
        try {
          srm.from_nested = this.matchSubmissionRequirements(pd, sr.from_nested, marked);
          submissionRequirementMatches.push(srm);
        } catch (err) {
          throw new Error(`Error in handling value of from_nested: ${sr.from_nested}: err: ${err}`);
        }
      } else {
        // Throw an error if neither 'from' nor 'from_nested' is found
        throw new Error("Invalid SubmissionRequirement object: Must contain either 'from' or 'from_nested'");
      }
    }
    return submissionRequirementMatches;
  }

  private matchWithoutSubmissionRequirements(marked: HandlerCheckResult[], pd: IInternalPresentationDefinition): SubmissionRequirementMatch[] {
    const submissionRequirementMatches: SubmissionRequirementMatch[] = [];
    const partitionedIdToVcMap: Map<string, string[]> = this.createIdToVcMap(marked);
    for (const [idPath, sameIdVcs] of partitionedIdToVcMap.entries()) {
      if (!sameIdVcs || !sameIdVcs.length) {
        continue;
      }
      for (const vcPath of sameIdVcs) {
        const inputDescriptorResults = JsonPathUtils.extractInputField<InputDescriptorV1 | InputDescriptorV2>(pd, [idPath]);
        if (inputDescriptorResults.length) {
          const inputDescriptor = inputDescriptorResults[0].value;
          submissionRequirementMatches.push({
            name: inputDescriptor.name || inputDescriptor.id,
            rule: Rules.All,
            vc_path: [vcPath],

            type: SubmissionRequirementMatchType.InputDescriptor,
            id: inputDescriptor.id,
          });
        }
      }
    }
    return this.removeDuplicateSubmissionRequirementMatches(submissionRequirementMatches);
  }

  private getMatchingVcPathsForSubmissionRequirement(
    pd: IInternalPresentationDefinition,
    sr: SubmissionRequirement,
    marked: HandlerCheckResult[],
  ): string[] {
    const vcPaths = new Set<string>();

    if (!sr.from) return Array.from(vcPaths);

    for (const m of marked) {
      const inputDescriptor: InputDescriptorV2 = jp.query(pd, m.input_descriptor_path)[0];
      if (inputDescriptor.group && inputDescriptor.group.indexOf(sr.from) === -1) {
        continue;
      }
      if (m.payload.group.includes(sr.from)) {
        vcPaths.add(m.verifiable_credential_path);
      }
    }

    return Array.from(vcPaths);
  }

  public evaluate(
    pd: IInternalPresentationDefinition,
    wvcs: WrappedVerifiableCredential[],
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      presentationSubmission?: PresentationSubmission;
      generatePresentationSubmission?: boolean;
    },
  ): EvaluationResults {
    this._client.evaluate(pd, wvcs, opts);
    const result: EvaluationResults = {
      areRequiredCredentialsPresent: Status.INFO,
      // TODO: we should handle the string case
      verifiableCredential: wvcs.map((wrapped) => wrapped.original as IVerifiableCredential | SdJwtDecodedVerifiableCredential),
    };
    result.warnings = this.formatNotInfo(Status.WARN);
    result.errors = this.formatNotInfo(Status.ERROR);

    this._client.assertPresentationSubmission();
    if (this._client.presentationSubmission?.descriptor_map.length) {
      this._client.presentationSubmission.descriptor_map = this._client.presentationSubmission.descriptor_map.filter((v) => v !== undefined);
      result.value = JSON.parse(JSON.stringify(this._client.presentationSubmission));
    }

    if (this._client.generatePresentationSubmission) {
      this.updatePresentationSubmissionPathToVpPath(result.value);
    }
    result.verifiableCredential = this._client.wrappedVcs.map((wrapped) => wrapped.original as IVerifiableCredential);
    result.areRequiredCredentialsPresent = result.value?.descriptor_map?.length ? Status.INFO : Status.ERROR;
    return result;
  }

  public evaluatePresentations(
    pd: IInternalPresentationDefinition,
    wvps: OrArray<WrappedVerifiablePresentation>,
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      presentationSubmission?: PresentationSubmission;
      generatePresentationSubmission?: boolean;
      /**
       * The location of the presentation submission. By default {@link PresentationSubmissionLocation.PRESENTATION}
       * is used when one W3C presentation is passed (not as array) , while {@link PresentationSubmissionLocation.EXTERNAL} is
       * used when an array is passed or the presentation is not a W3C presentation
       */
      presentationSubmissionLocation?: PresentationSubmissionLocation;
    },
  ): PresentationEvaluationResults {
    // If submission is provided as input, we match the presentations against the submission. In this case the submission MUST be valid
    if (opts?.presentationSubmission) {
      return this.evaluatePresentationsAgainstSubmission(pd, wvps, opts.presentationSubmission, opts);
    }

    const wrappedPresentations = Array.isArray(wvps) ? wvps : [wvps];
    const allWvcs = wrappedPresentations.reduce((all, wvp) => [...all, ...wvp.vcs], [] as WrappedVerifiableCredential[]);

    const result: PresentationEvaluationResults = {
      areRequiredCredentialsPresent: Status.INFO,
      presentations: Array.isArray(wvps) ? wvps.map((wvp) => wvp.original) : [wvps.original],
      errors: [],
      warnings: [],
    };

    this._client.evaluate(pd, allWvcs, opts);
    result.warnings = this.formatNotInfo(Status.WARN);
    result.errors = this.formatNotInfo(Status.ERROR);

    this._client.assertPresentationSubmission();
    if (this._client.presentationSubmission?.descriptor_map.length) {
      this._client.presentationSubmission.descriptor_map = this._client.presentationSubmission.descriptor_map.filter((v) => v !== undefined);
      result.value = JSON.parse(JSON.stringify(this._client.presentationSubmission));
    }

    const useExternalSubmission =
      opts?.presentationSubmissionLocation !== undefined
        ? opts.presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL
        : Array.isArray(wvps);

    if (this._client.generatePresentationSubmission && result.value && useExternalSubmission) {
      // we map the descriptors of the generated submisison to take into account the nexted values
      result.value.descriptor_map = result.value.descriptor_map.map((descriptor) => {
        const [wvcResult] = JsonPathUtils.extractInputField(allWvcs, [descriptor.path]) as Array<{
          value: WrappedVerifiableCredential;
        }>;
        if (!wvcResult) {
          throw new Error(`Could not find descriptor path ${descriptor.path} in wrapped verifiable credentials`);
        }
        const matchingWvc = wvcResult.value;
        const matchingVpIndex = wrappedPresentations.findIndex((wvp) => (wvp.vcs as WrappedVerifiableCredential[]).includes(matchingWvc));
        const matchingVp = wrappedPresentations[matchingVpIndex];
        const matcingWvcIndexInVp = matchingVp.vcs.findIndex((wvc) => wvc === matchingWvc);

        return this.updateDescriptorToExternal(descriptor, {
          // We don't want to add vp index if the input to evaluate was a single presentation
          vpIndex: Array.isArray(wvps) ? matchingVpIndex : undefined,
          vcIndex: matcingWvcIndexInVp,
        });
      });
    } else if (this._client.generatePresentationSubmission && result.value) {
      this.updatePresentationSubmissionPathToVpPath(result.value);
    }

    result.areRequiredCredentialsPresent = result.value?.descriptor_map?.length ? Status.INFO : Status.ERROR;

    return result;
  }

  private extractWrappedVcFromWrappedVp(
    descriptor: Descriptor,
    descriptorIndex: string,
    wvp: WrappedVerifiablePresentation,
  ): { error: Checked; wvc: undefined } | { wvc: WrappedVerifiableCredential; error: undefined } {
    // Decoded won't work for sd-jwt or jwt?!?!
    const [vcResult] = JsonPathUtils.extractInputField(wvp.decoded, [descriptor.path]) as Array<{
      value: string | IVerifiablePresentation[] | IVerifiableCredential;
    }>;

    if (!vcResult) {
      return {
        error: {
          status: Status.ERROR,
          tag: 'SubmissionPathNotFound',
          message: `Unable to extract path ${descriptor.path} for submission.descriptor_path[${descriptorIndex}] from verifiable presentation`,
        },
        wvc: undefined,
      };
    }

    // FIXME figure out possible types, can't see that in debug mode...
    const isCredential = CredentialMapper.isCredential(vcResult.value as OriginalVerifiableCredential);
    if (
      !vcResult.value ||
      (typeof vcResult.value === 'string' && !isCredential) ||
      (typeof vcResult.value !== 'string' && !isCredential && !('verifiableCredential' in vcResult.value || 'vp' in vcResult.value))
    ) {
      return {
        error: {
          status: Status.ERROR,
          tag: 'NoVerifiableCredentials',
          message: `No verifiable credentials found at path "${descriptor.path}" for submission.descriptor_path[${descriptorIndex}]`,
        },
        wvc: undefined,
      };
    }

    // When result is an array, extract the first Verifiable Credential from the array FIXME figure out proper types, can't see that in debug mode...
    let originalVc;
    if (isCredential) {
      originalVc = vcResult.value;
    } else if (typeof vcResult.value !== 'string') {
      if ('verifiableCredential' in vcResult.value) {
        originalVc = Array.isArray(vcResult.value.verifiableCredential)
          ? vcResult.value.verifiableCredential[0]
          : vcResult.value.verifiableCredential;
        // FIXME this may be too lenient
      } else if ('vp' in vcResult.value) {
        originalVc = Array.isArray(vcResult.value.vp.verifiableCredential)
          ? vcResult.value.vp.verifiableCredential[0]
          : vcResult.value.vp.verifiableCredential;
      } else {
        throw Error('Could not deduced original VC from evaluation result');
      }
    } else {
      throw Error('Could not deduced original VC from evaluation result');
    }

    // Find the corresponding Wrapped Verifiable Credential (wvc) based on the original VC
    const wvc = wvp.vcs.find((wrappedVc) => CredentialMapper.areOriginalVerifiableCredentialsEqual(wrappedVc.original, originalVc));

    if (!wvc) {
      return {
        error: {
          status: Status.ERROR,
          tag: 'SubmissionPathNotFound',
          message: `Unable to find wrapped VC for the extracted credential at path "${descriptor.path}" in descriptor_path[${descriptorIndex}]`,
        },
        wvc: undefined,
      };
    }

    return {
      wvc,
      error: undefined,
    };
  }

  private evaluatePresentationsAgainstSubmission(
    pd: IInternalPresentationDefinition,
    wvps: OrArray<WrappedVerifiablePresentation>,
    submission: PresentationSubmission,
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      presentationSubmissionLocation?: PresentationSubmissionLocation;
    },
  ): PresentationEvaluationResults {
    const result: PresentationEvaluationResults = {
      areRequiredCredentialsPresent: Status.INFO,
      presentations: Array.isArray(wvps) ? wvps.map((wvp) => wvp.original) : [wvps.original],
      errors: [],
      warnings: [],
      value: submission,
    };

    // If only a single VP is passed that is not w3c and no presentationSubmissionLocation, we set the default location to presentation. Otherwise we assume it's external
    const presentationSubmissionLocation =
      opts?.presentationSubmissionLocation ??
      (Array.isArray(wvps) || !CredentialMapper.isW3cPresentation(Array.isArray(wvps) ? wvps[0].presentation : wvps.presentation)
        ? PresentationSubmissionLocation.EXTERNAL
        : PresentationSubmissionLocation.PRESENTATION);

    // Iterate over each descriptor in the submission
    for (const [descriptorIndex, descriptor] of submission.descriptor_map.entries()) {
      let matchingVps: WrappedVerifiablePresentation[] = [];

      if (presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL) {
        // Extract VPs matching the descriptor path
        const vpResults = JsonPathUtils.extractInputField(wvps, [descriptor.path]) as Array<{
          value: WrappedVerifiablePresentation[];
        }>;

        if (!vpResults.length) {
          result.areRequiredCredentialsPresent = Status.ERROR;
          result.errors?.push({
            status: Status.ERROR,
            tag: 'SubmissionPathNotFound',
            message: `Unable to extract path ${descriptor.path} for submission.descriptor_map[${descriptorIndex}] from presentation(s)`,
          });
          continue;
        }

        // Flatten the array of VPs
        const allVps = vpResults.flatMap((vpResult) => vpResult.value);

        // Filter VPs that match the required format
        matchingVps = allVps.filter((vp) => vp.format === descriptor.format);

        if (!matchingVps.length) {
          result.areRequiredCredentialsPresent = Status.ERROR;
          result.errors?.push({
            status: Status.ERROR,
            tag: 'SubmissionFormatNoMatch',
            message: `No VP at path ${descriptor.path} matches the required format ${descriptor.format}`,
          });
          continue;
        }

        // Log a warning if multiple VPs match the descriptor
        if (matchingVps.length > 1) {
          result.warnings?.push({
            status: Status.WARN,
            tag: 'MultipleVpsMatched',
            message: `Multiple VPs matched for descriptor_path[${descriptorIndex}]. Using the first matching VP.`,
          });
        }
      } else {
        // When submission location is PRESENTATION, assume a single VP
        matchingVps = Array.isArray(wvps) ? [wvps[0]] : [wvps];
      }

      // Process the first matching VP
      const vp = matchingVps[0];
      let vc: WrappedVerifiableCredential;
      let vcPath: string = `presentation ${descriptor.path}`;

      if (presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL) {
        if (descriptor.path_nested) {
          const extractionResult = this.extractWrappedVcFromWrappedVp(descriptor.path_nested, descriptorIndex.toString(), vp);
          if (extractionResult.error) {
            result.areRequiredCredentialsPresent = Status.ERROR;
            result.errors?.push(extractionResult.error);
            continue;
          }

          vc = extractionResult.wvc;
          vcPath += ` with nested credential ${descriptor.path_nested.path}`;
        } else if (descriptor.format === 'vc+sd-jwt') {
          if (!vp.vcs || !vp.vcs.length) {
            result.areRequiredCredentialsPresent = Status.ERROR;
            result.errors?.push({
              status: Status.ERROR,
              tag: 'NoCredentialsFound',
              message: `No credentials found in VP at path ${descriptor.path}`,
            });
            continue;
          }
          vc = vp.vcs[0];
        } else {
          result.areRequiredCredentialsPresent = Status.ERROR;
          result.errors?.push({
            status: Status.ERROR,
            tag: 'UnsupportedFormat',
            message: `VP format ${vp.format} is not supported`,
          });
          continue;
        }
      } else {
        const extractionResult = this.extractWrappedVcFromWrappedVp(descriptor, descriptorIndex.toString(), vp);
        if (extractionResult.error) {
          result.areRequiredCredentialsPresent = Status.ERROR;
          result.errors?.push(extractionResult.error);
          continue;
        }

        vc = extractionResult.wvc;
        vcPath = `credential ${descriptor.path}`;
      }

      // TODO: we should probably add support for holder dids in the kb-jwt of an SD-JWT. We can extract this from the
      // `wrappedPresentation.original.compactKbJwt`, but as HAIP doesn't use dids, we'll leave it for now.

      // Determine holder DIDs
      const holderDIDs =
        CredentialMapper.isW3cPresentation(vp.presentation) && vp.presentation.holder ? [vp.presentation.holder] : opts?.holderDIDs || [];

      // Get the presentation definition specific to the current descriptor
      const pdForDescriptor = this.internalPresentationDefinitionForDescriptor(pd, descriptor.id);

      // Reset and configure the evaluation client
      this._client = new EvaluationClient();
      this._client.evaluate(pdForDescriptor, [vc], {
        ...opts,
        holderDIDs,
        presentationSubmission: undefined,
        generatePresentationSubmission: undefined,
      });

      // Check if the evaluation resulted in exactly one descriptor map entry
      if (this._client.presentationSubmission.descriptor_map.length !== 1) {
        const submissionDescriptor = `submission.descriptor_map[${descriptorIndex}]`;
        result.areRequiredCredentialsPresent = Status.ERROR;
        result.errors?.push(...this.formatNotInfo(Status.ERROR, submissionDescriptor, vcPath));
        result.warnings?.push(...this.formatNotInfo(Status.WARN, submissionDescriptor, vcPath));
      }
    }

    // Validate if the submission satisfies the presentation definition
    const submissionAgainstDefinitionResult = this.validateIfSubmissionSatisfiesDefinition(pd, submission);
    if (!submissionAgainstDefinitionResult.doesSubmissionSatisfyDefinition) {
      result.errors?.push({
        status: Status.ERROR,
        tag: 'SubmissionDoesNotSatisfyDefinition',
        // TODO: it would be nice to add the nested errors here for beter understanding WHY the submission
        // does not satisfy the definition, as we have that info, but we can only include one message here

        message: submissionAgainstDefinitionResult.error,
      });
      result.areRequiredCredentialsPresent = Status.ERROR;
    }

    return result;
  }

  private checkIfSubmissionSatisfiesSubmissionRequirement(
    pd: IInternalPresentationDefinition,
    submission: PresentationSubmission,
    submissionRequirement: SubmissionRequirement,
    submissionRequirementName: string,
  ): SubmissionSatisfiesSubmissionRequirementResult {
    if ((submissionRequirement.from && submissionRequirement.from_nested) || (!submissionRequirement.from && !submissionRequirement.from_nested)) {
      return {
        isSubmissionRequirementSatisfied: false,
        totalMatches: 0,
        errors: [
          `Either 'from' OR 'from_nested' MUST be present on submission requirement ${submissionRequirementName}, but not neither and not both`,
        ],
      };
    }

    const result: SubmissionSatisfiesSubmissionRequirementResult = {
      isSubmissionRequirementSatisfied: false,
      totalMatches: 0,
      maxRequiredMatches: submissionRequirement.rule === Rules.Pick ? submissionRequirement.max : undefined,
      minRequiredMatches: submissionRequirement.rule === Rules.Pick ? submissionRequirement.min : undefined,
      errors: [],
    };

    // Populate from_nested requirements
    if (submissionRequirement.from_nested) {
      const nestedResults = submissionRequirement.from_nested.map((nestedSubmissionRequirement, index) =>
        this.checkIfSubmissionSatisfiesSubmissionRequirement(
          pd,
          submission,
          nestedSubmissionRequirement,
          `${submissionRequirementName}.from_nested[${index}]`,
        ),
      );

      result.totalRequiredMatches = submissionRequirement.rule === Rules.All ? submissionRequirement.from_nested.length : submissionRequirement.count;
      result.totalMatches = nestedResults.filter((n) => n.isSubmissionRequirementSatisfied).length;
      result.nested = nestedResults;
    }

    // Populate from requirements
    if (submissionRequirement.from) {
      const inputDescriptorsForGroup = pd.input_descriptors.filter((descriptor) => descriptor.group?.includes(submissionRequirement.from as string));
      const descriptorIdsInSubmission = submission.descriptor_map.map((descriptor) => descriptor.id);
      const inputDescriptorsInSubmission = inputDescriptorsForGroup.filter((inputDescriptor) =>
        descriptorIdsInSubmission.includes(inputDescriptor.id),
      );

      result.totalMatches = inputDescriptorsInSubmission.length;
      result.totalRequiredMatches = submissionRequirement.rule === Rules.All ? inputDescriptorsForGroup.length : submissionRequirement.count;
    }

    // Validate if the min/max/count requirements are satisfied
    if (result.totalRequiredMatches !== undefined && result.totalMatches !== result.totalRequiredMatches) {
      result.errors.push(
        `Expected ${result.totalRequiredMatches} requirements to be satisfied for submission requirement ${submissionRequirementName}, but found ${result.totalMatches}`,
      );
    }

    if (result.minRequiredMatches !== undefined && result.totalMatches < result.minRequiredMatches) {
      result.errors.push(
        `Expected at least ${result.minRequiredMatches} requirements to be satisfied from submission requirement ${submissionRequirementName}, but found ${result.totalMatches}`,
      );
    }

    if (result.maxRequiredMatches !== undefined && result.totalMatches > result.maxRequiredMatches) {
      result.errors.push(
        `Expected at most ${result.maxRequiredMatches} requirements to be satisfied from submission requirement ${submissionRequirementName}, but found ${result.totalMatches}`,
      );
    }

    result.isSubmissionRequirementSatisfied = result.errors.length === 0;
    return result;
  }

  /**
   * Checks whether a submission satisfies the requirements of a presentation definition
   */
  private validateIfSubmissionSatisfiesDefinition(
    pd: IInternalPresentationDefinition,
    submission: PresentationSubmission,
  ): SubmissionSatisfiesDefinitionResult {
    const submissionDescriptorIds = submission.descriptor_map.map((descriptor) => descriptor.id);

    const result: SubmissionSatisfiesDefinitionResult = {
      doesSubmissionSatisfyDefinition: false,
      totalMatches: 0,
      totalRequiredMatches: 0,
    };

    // All MUST match
    if (pd.submission_requirements) {
      const submissionRequirementResults = pd.submission_requirements.map((submissionRequirement, index) =>
        this.checkIfSubmissionSatisfiesSubmissionRequirement(pd, submission, submissionRequirement, `$.submission_requirements[${index}]`),
      );

      result.totalRequiredMatches = pd.submission_requirements.length;
      result.totalMatches = submissionRequirementResults.filter((r) => r.isSubmissionRequirementSatisfied).length;
      result.submisisonRequirementResults = submissionRequirementResults;

      if (result.totalMatches !== result.totalRequiredMatches) {
        result.error = `Expected all submission requirements (${result.totalRequiredMatches}) to be satisfifed in submission, but found ${result.totalMatches}.`;
      }
    } else {
      result.totalRequiredMatches = pd.input_descriptors.length;
      result.totalMatches = submissionDescriptorIds.length;
      const notInSubmission = pd.input_descriptors.filter((inputDescriptor) => !submissionDescriptorIds.includes(inputDescriptor.id));

      if (notInSubmission.length > 0) {
        result.error = `Expected all input descriptors (${pd.input_descriptors.length}) to be satisfifed in submission, but found ${submissionDescriptorIds.length}. Missing ${notInSubmission.map((d) => d.id).join(', ')}`;
      }
    }

    result.doesSubmissionSatisfyDefinition = result.error === undefined;
    return result;
  }

  private internalPresentationDefinitionForDescriptor(pd: IInternalPresentationDefinition, descriptorId: string): IInternalPresentationDefinition {
    if (pd instanceof InternalPresentationDefinitionV2) {
      const inputDescriptorIndex = pd.input_descriptors.findIndex((i) => i.id === descriptorId);
      return new InternalPresentationDefinitionV2(
        pd.id,
        [pd.input_descriptors[inputDescriptorIndex]],
        pd.format,
        pd.frame,
        pd.name,
        pd.purpose,
        // we ignore submission requirements as we're verifying a single input descriptor here
        undefined,
      );
    } else if (pd instanceof InternalPresentationDefinitionV1) {
      const inputDescriptorIndex = pd.input_descriptors.findIndex((i) => i.id === descriptorId);
      return new InternalPresentationDefinitionV1(
        pd.id,
        [pd.input_descriptors[inputDescriptorIndex]],
        pd.format,
        pd.name,
        pd.purpose,
        // we ignore submission requirements as we're verifying a single input descriptor here
        undefined,
      );
    }

    throw new Error('Unrecognized presentation definition instance');
  }

  private formatNotInfo(status: Status, descriptorPath?: string, vcPath?: string): Checked[] {
    return this._client.results
      .filter((result) => result.status === status)
      .map((x) => {
        const _vcPath = vcPath ?? `$.verifiableCredential${x.verifiable_credential_path.substring(1)}`;
        const _descriptorPath = descriptorPath ?? x.input_descriptor_path;
        return {
          tag: x.evaluator,
          status: x.status,
          message: `${x.message}: ${_descriptorPath}: ${_vcPath}`,
        };
      });
  }

  public submissionFrom(
    pd: IInternalPresentationDefinition,
    vcs: WrappedVerifiableCredential[],
    opts?: {
      presentationSubmissionLocation?: PresentationSubmissionLocation;
    },
  ): PresentationSubmission {
    if (!this._client.results || this._client.results.length === 0) {
      throw Error('You need to call evaluate() before pex.presentationFrom()');
    }
    if (!this._client.generatePresentationSubmission) {
      return this._client.presentationSubmission;
    }

    if (pd.submission_requirements) {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR,
      );
      const [updatedMarked, upIdx] = this.matchUserSelectedVcs(marked, vcs);
      const groupCount = new Map<string, number>();
      //TODO instanceof fails in some cases, need to check how to fix it
      if ('input_descriptors' in pd) {
        (pd as unknown as IPresentationDefinition).input_descriptors.forEach((e: InputDescriptorV1 | InputDescriptorV2) => {
          if (e.group) {
            e.group.forEach((key: string) => {
              if (groupCount.has(key)) {
                groupCount.set(key, (groupCount.get(key) as number) + 1);
              } else {
                groupCount.set(key, 1);
              }
            });
          }
        });
      }
      const result: [number, HandlerCheckResult[]] = this.evaluateRequirements(pd.submission_requirements, updatedMarked, groupCount, 0);
      const finalIdx = upIdx.filter((ui) => result[1].find((r) => r.verifiable_credential_path === ui[1]));
      this.updatePresentationSubmission(finalIdx);
      this.updatePresentationSubmissionPathToVpPath();
      if (opts?.presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL) {
        this.updatePresentationSubmissionToExternal();
      }
      return this._client.presentationSubmission;
    }
    const marked: HandlerCheckResult[] = this._client.results.filter(
      (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== Status.ERROR,
    );
    const updatedIndexes = this.matchUserSelectedVcs(marked, vcs);
    this.updatePresentationSubmission(updatedIndexes[1]);

    this.updatePresentationSubmissionPathToVpPath();
    if (opts?.presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL) {
      this.updatePresentationSubmissionToExternal();
    }
    return this._client.presentationSubmission;
  }

  private updatePresentationSubmission(updatedIndexes: [string, string][]) {
    if (!this._client.generatePresentationSubmission) {
      return; // never update a supplied submission
    }
    this._client.presentationSubmission.descriptor_map = this._client.presentationSubmission.descriptor_map
      .filter((descriptor) => updatedIndexes.find((ui) => ui[0] === descriptor.path))
      .map((descriptor) => {
        const result = updatedIndexes.find((ui) => ui[0] === descriptor.path);
        if (result) {
          descriptor.path = result[1];
        }
        return descriptor;
      });
  }

  private updatePresentationSubmissionToExternal(presentationSubmission?: PresentationSubmission): PresentationSubmission {
    const descriptors = presentationSubmission?.descriptor_map ?? this._client.presentationSubmission.descriptor_map;
    const updatedDescriptors = descriptors.map((d) => this.updateDescriptorToExternal(d));

    if (presentationSubmission) {
      return {
        ...presentationSubmission,
        descriptor_map: updatedDescriptors,
      };
    }

    this._client.presentationSubmission.descriptor_map = updatedDescriptors;
    return this._client.presentationSubmission;
  }

  private updateDescriptorToExternal(
    descriptor: Descriptor,
    {
      vpIndex,
      vcIndex,
    }: {
      /* index of the vp. if not provided $ will be used */
      vpIndex?: number;
      /* index of the vc in the vp. if not provided, the current index on the descriptor will be used */
      vcIndex?: number;
    } = {},
  ) {
    if (descriptor.path_nested) {
      return descriptor;
    }

    const { nestedCredentialPath, vpFormat } = getVpFormatForVcFormat(descriptor.format);

    const newDescriptor = {
      ...descriptor,
      format: vpFormat,
      path: vpIndex !== undefined ? `$[${vpIndex}]` : '$',
    };

    if (nestedCredentialPath) {
      newDescriptor.path_nested = {
        ...descriptor,
        path:
          vcIndex !== undefined
            ? `${nestedCredentialPath}[${vcIndex}]`
            : descriptor.path.replace('$.verifiableCredential', nestedCredentialPath).replace('$[', `${nestedCredentialPath}[`),
      };
    }

    return newDescriptor;
  }

  private matchUserSelectedVcs(marked: HandlerCheckResult[], vcs: WrappedVerifiableCredential[]): [HandlerCheckResult[], [string, string][]] {
    const userSelected: [number, string][] = vcs.map((vc, index) => [index, JSON.stringify(vc.original)]);
    const allCredentials: [number, string][] = this._client.wrappedVcs.map((vc, index) => [index, JSON.stringify(vc.original)]);
    const updatedIndexes: [string, string][] = [];
    userSelected.forEach((us, i) => {
      allCredentials.forEach((ac, j) => {
        if (ac[1] === us[1]) {
          updatedIndexes.push([`$[${j}]`, `$[${i}]`]);
        }
      });
    });

    marked = marked
      .filter((m) => updatedIndexes.find((ui) => ui[0] === m.verifiable_credential_path))
      .map((m) => {
        const index = updatedIndexes.find((ui) => ui[0] === m.verifiable_credential_path);
        if (index) {
          m.verifiable_credential_path = index[1];
        }
        return m;
      });
    return [marked, updatedIndexes];
  }

  private evaluateRequirements(
    submissionRequirement: SubmissionRequirement[],
    marked: HandlerCheckResult[],
    groupCount: Map<string, number>,
    level: number,
  ): [number, HandlerCheckResult[]] {
    let total = 0;
    const result: HandlerCheckResult[] = [];
    for (const sr of submissionRequirement) {
      if (sr.from) {
        if (sr.rule === Rules.All) {
          const [count, matched] = this.countMatchingInputDescriptors(sr, marked);
          if (count !== (groupCount.get(sr.from) || 0)) {
            throw Error(`Not all input descriptors are members of group ${sr.from}`);
          }
          total++;
          result.push(...matched);
        } else if (sr.rule === Rules.Pick) {
          const [count, matched] = this.countMatchingInputDescriptors(sr, marked);
          try {
            this.handleCount(sr, count, level);
            total++;
          } catch (error) {
            if (level === 0) throw error;
          }
          result.push(...matched);
        }
      } else if (sr.from_nested) {
        const [count, matched] = this.evaluateRequirements(sr.from_nested, marked, groupCount, ++level);
        total += count;
        result.push(...matched);
        this.handleCount(sr, count, level);
      }
    }
    return [total, result];
  }

  private countMatchingInputDescriptors(submissionRequirement: SubmissionRequirement, marked: HandlerCheckResult[]): [number, HandlerCheckResult[]] {
    let count = 0;
    const matched: HandlerCheckResult[] = [];
    for (const m of marked) {
      if (m.payload.group.includes(submissionRequirement.from)) {
        matched.push(m);
        count++;
      }
    }
    return [count, matched];
  }

  private handleCount(submissionRequirement: SubmissionRequirement, count: number, level: number): void {
    if (submissionRequirement.count) {
      if (count !== submissionRequirement.count) {
        throw Error(`Count: expected: ${submissionRequirement.count} actual: ${count} at level: ${level}`);
      }
    }
    if (submissionRequirement.min) {
      if (count < submissionRequirement.min) {
        throw Error(`Min: expected: ${submissionRequirement.min} actual: ${count} at level: ${level}`);
      }
    }
    if (submissionRequirement.max) {
      if (count > submissionRequirement.max) {
        throw Error(`Max: expected: ${submissionRequirement.max} actual: ${count} at level: ${level}`);
      }
    }
  }

  private removeDuplicateSubmissionRequirementMatches(matches: SubmissionRequirementMatch[]) {
    return matches.filter((match, index) => {
      const _match = JSON.stringify(match);
      return (
        index ===
        matches.findIndex((obj) => {
          return JSON.stringify(obj) === _match;
        })
      );
    });
  }

  public fillSelectableCredentialsToVerifiableCredentialsMapping(selectResults: SelectResults, wrappedVcs: WrappedVerifiableCredential[]) {
    if (selectResults) {
      selectResults.verifiableCredential?.forEach((selectableCredential) => {
        const foundIndex = wrappedVcs.findIndex((wrappedVc) =>
          CredentialMapper.areOriginalVerifiableCredentialsEqual(wrappedVc.original, selectableCredential),
        );

        if (foundIndex === -1) {
          throw new Error('index is not right');
        }
        selectResults.vcIndexes
          ? !selectResults.vcIndexes.includes(foundIndex) && selectResults.vcIndexes.push(foundIndex)
          : (selectResults.vcIndexes = [foundIndex]);
      });
    }
  }

  public determineAreRequiredCredentialsPresent(
    presentationDefinition: IInternalPresentationDefinition,
    matchSubmissionRequirements: SubmissionRequirementMatch[] | undefined,
    parentMsr?: SubmissionRequirementMatch,
  ): Status {
    if (!matchSubmissionRequirements || !matchSubmissionRequirements.length) {
      return Status.ERROR;
    }

    // collect child statuses
    const childStatuses = matchSubmissionRequirements.map((m) => this.determineSubmissionRequirementStatus(presentationDefinition, m));

    // decide status based on child statuses and parent's rule
    if (!parentMsr) {
      if (childStatuses.includes(Status.ERROR)) {
        return Status.ERROR;
      } else if (childStatuses.includes(Status.WARN)) {
        return Status.WARN;
      } else {
        return Status.INFO;
      }
    } else {
      if (parentMsr.rule === Rules.All && childStatuses.includes(Status.ERROR)) {
        return Status.ERROR;
      }

      const nonErrStatCount = childStatuses.filter((status) => status !== Status.ERROR).length;

      if (parentMsr.count) {
        return parentMsr.count > nonErrStatCount ? Status.ERROR : parentMsr.count < nonErrStatCount ? Status.WARN : Status.INFO;
      } else {
        if (parentMsr.min && parentMsr.min > nonErrStatCount) {
          return Status.ERROR;
        } else if (parentMsr.max && parentMsr.max < nonErrStatCount) {
          return Status.WARN;
        }
      }
    }

    return Status.INFO;
  }

  private determineSubmissionRequirementStatus(pd: IInternalPresentationDefinition, m: SubmissionRequirementMatch): Status {
    if (m.from && m.from_nested) {
      throw new Error('Invalid submission_requirement object: MUST contain either a from or from_nested property.');
    }

    if (!m.from && !m.from_nested && m.vc_path.length !== 1) {
      return Status.ERROR;
    }

    if (m.from) {
      const groupCount = this.countGroupIDs((pd as InternalPresentationDefinitionV2).input_descriptors, m.from);
      switch (m.rule) {
        case Rules.All:
          // Ensure that all descriptors associated with `m.from` are satisfied.
          return m.vc_path.length === groupCount ? Status.INFO : Status.WARN;
        case Rules.Pick:
          return this.getPickRuleStatus(m);
        default:
          return Status.ERROR;
      }
    } else if (m.from_nested) {
      return this.determineAreRequiredCredentialsPresent(pd, m.from_nested, m);
    }

    return Status.INFO;
  }

  private getPickRuleStatus(m: SubmissionRequirementMatch): Status {
    if (m.vc_path.length === 0) {
      return Status.ERROR;
    }

    if (m.count && m.vc_path.length !== m.count) {
      return m.vc_path.length > m.count ? Status.WARN : Status.ERROR;
    }

    if (m.min && m.vc_path.length < m.min) {
      return Status.ERROR;
    }

    if (m.max && m.vc_path.length > m.max) {
      return Status.WARN;
    }

    return Status.INFO;
  }

  private updateSubmissionRequirementMatchPathToAlias(submissionRequirementMatch: SubmissionRequirementMatch, alias: string) {
    const vc_path: string[] = [];
    submissionRequirementMatch.vc_path.forEach((m) => {
      if (m.startsWith(`$.${alias}`)) {
        vc_path.push(m);
      } else {
        vc_path.push(m.replace('$', `$.${alias}`));
      }
    });
    submissionRequirementMatch.vc_path = vc_path;
    if (submissionRequirementMatch.from_nested) {
      submissionRequirementMatch.from_nested.forEach((f) => {
        this.updateSubmissionRequirementMatchPathToAlias(f, alias);
      });
    }
  }

  private updatePresentationSubmissionPathToVpPath(presentationSubmission?: PresentationSubmission) {
    const descriptorMap = presentationSubmission
      ? presentationSubmission.descriptor_map
      : this._client.generatePresentationSubmission
        ? this._client.presentationSubmission.descriptor_map
        : undefined;

    descriptorMap?.forEach((d) => {
      // NOTE: currently we only support a single VP for a single PD, so that means an SD-JWT will always have the path '$'.
      // If there is more consensus on whether a PD can result in one submission with multiple VPs, we could tweak this logic
      // to keep supporting arrays (so it will just stay as the input format) if there's multiple SD-JWTs that are included
      // in the presentation submission (we would allow the presentationFrom and verifiablePresentationFrom to just return
      // an array of VPs, while still one submission is returned. This will also help with creating multiple VPs for JWT credentials)
      // See https://github.com/decentralized-identity/presentation-exchange/issues/462
      // Also see: https://github.com/openid/OpenID4VP/issues/69
      if (d.format === 'vc+sd-jwt') {
        //d.path = '$'; we do return multiple presentations now
      } else {
        this.replacePathWithAlias(d, 'verifiableCredential');
      }
    });
  }

  private replacePathWithAlias(descriptor: Descriptor, alias: string) {
    descriptor.path = descriptor.path.replace(`$[`, `$.${alias}[`);
    if (descriptor.path_nested) {
      this.replacePathWithAlias(descriptor.path_nested, alias);
    }
  }

  private createIdToVcMap(marked: HandlerCheckResult[]): Map<string, string[]> {
    const partitionedResults: Map<string, string[]> = new Map<string, string[]>();

    const partitionedBasedOnId: Map<string, HandlerCheckResult[]> = new Map<string, HandlerCheckResult[]>();
    for (let i = 0; i < marked.length; i++) {
      const currentIdPath: string = marked[i].input_descriptor_path;
      if (partitionedBasedOnId.has(currentIdPath)) {
        const partBasedOnId = partitionedBasedOnId.get(currentIdPath);
        if (partBasedOnId) {
          partBasedOnId.push(marked[i]);
        }
      } else {
        partitionedBasedOnId.set(currentIdPath, [marked[i]]);
      }
    }

    for (const [idPath, sameVcCheckResults] of partitionedBasedOnId.entries()) {
      const vcPaths: string[] = [];
      for (let i = 0; i < sameVcCheckResults.length; i++) {
        if (vcPaths.indexOf(sameVcCheckResults[i].verifiable_credential_path) === -1) {
          vcPaths.push(sameVcCheckResults[i].verifiable_credential_path);
        }
      }
      partitionedResults.set(idPath, vcPaths);
    }
    return partitionedResults;
  }

  private countGroupIDs(input_descriptors: Array<InputDescriptorV2>, from: string): number {
    let count = 0;
    for (const descriptor of input_descriptors) {
      if (descriptor.group && descriptor.group.includes(from)) {
        count++;
      }
    }
    return count;
  }
}
