import { Descriptor, Format, InputDescriptorV1, InputDescriptorV2, PresentationSubmission, Rules, SubmissionRequirement } from '@sphereon/pex-models';
import { IVerifiableCredential, WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Checked, Status } from '../ConstraintUtils';
import { IInternalPresentationDefinition, IPresentationDefinition } from '../types';
import { jp, JsonPathUtils } from '../utils';

import { EvaluationResults, HandlerCheckResult, SelectResults, SubmissionRequirementMatch } from './core';
import { EvaluationClient } from './evaluationClient';

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
    }
  ): SelectResults {
    let selectResults: SelectResults;

    this._client.evaluate(presentationDefinition, wrappedVerifiableCredentials, opts);
    const warnings: Checked[] = [...this.formatNotInfo(Status.WARN)];
    const errors: Checked[] = [...this.formatNotInfo(Status.ERROR)];

    if (presentationDefinition.submission_requirements) {
      const info: HandlerCheckResult[] = this._client.results.filter(
        (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR
      );
      const marked = Array.from(new Set(info));
      const matchSubmissionRequirements = this.matchSubmissionRequirements(
        presentationDefinition,
        presentationDefinition.submission_requirements,
        marked
      );
      const matches = this.extractMatches(matchSubmissionRequirements);
      const credentials: IVerifiableCredential[] = matches.map(
        (e) =>
          jp.nodes(
            this._client.wrappedVcs.map((wrapped) => wrapped.original),
            e
          )[0].value
      );
      selectResults = {
        errors: errors,
        matches: [...matchSubmissionRequirements],
        areRequiredCredentialsPresent: Status.INFO,
        verifiableCredential: credentials,
        warnings,
      };
    } else {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== Status.ERROR
      );
      const matchSubmissionRequirements = this.matchWithoutSubmissionRequirements(marked, presentationDefinition);
      const matches = this.extractMatches(matchSubmissionRequirements);
      const credentials: IVerifiableCredential[] = matches.map(
        (e) =>
          jp.nodes(
            this._client.wrappedVcs.map((wrapped) => wrapped.original),
            e
          )[0].value
      );
      selectResults = {
        errors: errors,
        matches: [...matchSubmissionRequirements],
        areRequiredCredentialsPresent: Status.INFO,
        verifiableCredential: credentials,
        warnings,
      };
    }

    this.fillSelectableCredentialsToVerifiableCredentialsMapping(selectResults, wrappedVerifiableCredentials);
    selectResults.areRequiredCredentialsPresent = this.determineAreRequiredCredentialsPresent(selectResults?.matches);
    this.remapMatches(
      wrappedVerifiableCredentials.map((wrapped) => wrapped.original as IVerifiableCredential),
      selectResults.matches,
      selectResults?.verifiableCredential
    );
    selectResults.matches?.forEach((m) => {
      this.updateSubmissionRequirementMatchPathToAlias(m, 'verifiableCredential');
    });
    if (selectResults.areRequiredCredentialsPresent === Status.INFO) {
      selectResults.errors = [];
    }
    return selectResults;
  }

  private remapMatches(
    verifiableCredentials: IVerifiableCredential[],
    submissionRequirementMatches?: SubmissionRequirementMatch[],
    vcsToSend?: IVerifiableCredential[]
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
              `The index of the VerifiableCredential in your current call can't be found in your previously submitted credentials. Are you trying to send a new Credential?\nverifiableCredential: ${vc}`
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

  private matchSubmissionRequirements(
    pd: IInternalPresentationDefinition,
    submissionRequirements: SubmissionRequirement[],
    marked: HandlerCheckResult[]
  ): SubmissionRequirementMatch[] {
    const submissionRequirementMatches: SubmissionRequirementMatch[] = [];
    for (const sr of submissionRequirements) {
      if (sr.from) {
        const matchingDescriptors = this.mapMatchingDescriptors(pd, sr, marked);
        if (matchingDescriptors) {
          sr.min ? (matchingDescriptors.min = sr.min) : undefined;
          sr.max ? (matchingDescriptors.max = sr.max) : undefined;
          sr.count ? (matchingDescriptors.count = sr.count) : undefined;
          submissionRequirementMatches.push(matchingDescriptors);
        }
      } else if (sr.from_nested) {
        const srm: SubmissionRequirementMatch = { name: pd.name || pd.id, rule: sr.rule, from_nested: [], vc_path: [] };
        if (srm && srm.from_nested) {
          sr.min ? (srm.min = sr.min) : undefined;
          sr.max ? (srm.max = sr.max) : undefined;
          sr.count ? (srm.count = sr.count) : undefined;
          srm.from_nested.push(...this.matchSubmissionRequirements(pd, sr.from_nested, marked));
          submissionRequirementMatches.push(srm);
        }
      }
    }
    return submissionRequirementMatches;
  }

  private matchWithoutSubmissionRequirements(marked: HandlerCheckResult[], pd: IInternalPresentationDefinition): SubmissionRequirementMatch[] {
    const submissionRequirementMatches: SubmissionRequirementMatch[] = [];
    const partitionedResults: Map<string, string[]> = this.createVcToIdMap(marked);
    for (const [vcPath, sameVcIds] of partitionedResults.entries()) {
      if (sameVcIds.length && sameVcIds.length === (pd as unknown as IPresentationDefinition).input_descriptors.length) {
        for (const idPath of sameVcIds) {
          const idRes = JsonPathUtils.extractInputField(pd, [idPath]);
          if (idRes.length) {
            submissionRequirementMatches.push({
              name: (idRes[0].value as InputDescriptorV1 | InputDescriptorV2).name || (idRes[0].value as InputDescriptorV1 | InputDescriptorV2).id,
              rule: Rules.All,
              vc_path: [vcPath],
            });
          }
        }
      }
    }
    return this.removeDuplicateSubmissionRequirementMatches(submissionRequirementMatches);
  }

  private mapMatchingDescriptors(
    pd: IInternalPresentationDefinition,
    sr: SubmissionRequirement,
    marked: HandlerCheckResult[]
  ): SubmissionRequirementMatch {
    const srm: Partial<SubmissionRequirementMatch> = { rule: sr.rule, from: [], vc_path: [] };
    if (sr?.from) {
      srm.from?.push(sr.from);
      for (const m of marked) {
        const inDesc = jp.query(pd, m.input_descriptor_path)[0];
        srm.name = inDesc.name || inDesc.id;
        if (m.payload.group.includes(sr.from)) {
          if (srm.vc_path?.indexOf(m.verifiable_credential_path) === -1) {
            srm.vc_path.push(m.verifiable_credential_path);
          }
        }
      }
    }
    return srm as SubmissionRequirementMatch;
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
    }
  ): EvaluationResults {
    this._client.evaluate(pd, wvcs, opts);
    const result: EvaluationResults = {
      areRequiredCredentialsPresent: Status.INFO,
      verifiableCredential: wvcs.map((wrapped) => wrapped.original as IVerifiableCredential),
    };
    result.warnings = this.formatNotInfo(Status.WARN);
    result.errors = this.formatNotInfo(Status.ERROR);

    this._client.assertPresentationSubmission();
    if (this._client.presentationSubmission?.descriptor_map.length) {
      const len = this._client.presentationSubmission?.descriptor_map.length;
      for (let i = 0; i < len; i++) {
        this._client.presentationSubmission.descriptor_map[i] &&
          this._client.presentationSubmission.descriptor_map.push(this._client.presentationSubmission.descriptor_map[i]);
      }
      this._client.presentationSubmission.descriptor_map.splice(0, len); // cut the array and leave only the non-empty values
      result.value = JSON.parse(JSON.stringify(this._client.presentationSubmission));
    }
    if (this._client.generatePresentationSubmission) {
      this.updatePresentationSubmissionPathToAlias('verifiableCredential', result.value);
    }
    result.verifiableCredential = this._client.wrappedVcs.map((wrapped) => wrapped.original as IVerifiableCredential);
    result.areRequiredCredentialsPresent = result.value?.descriptor_map?.length ? Status.INFO : Status.ERROR;
    return result;
  }

  private formatNotInfo(status: Status): Checked[] {
    return this._client.results
      .filter((result) => result.status === status)
      .map((x) => {
        const vcPath = x.verifiable_credential_path.substring(1);
        return {
          tag: x.evaluator,
          status: x.status,
          message: `${x.message}: ${x.input_descriptor_path}: $.verifiableCredential${vcPath}`,
        };
      });
  }

  public submissionFrom(pd: IInternalPresentationDefinition, vcs: WrappedVerifiableCredential[]): PresentationSubmission {
    if (!this._client.results.length) {
      throw Error('You need to call evaluate() before pex.presentationFrom()');
    }
    if (!this._client.generatePresentationSubmission) {
      return this._client.presentationSubmission;
    }

    if (pd.submission_requirements) {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR
      );
      const [updatedMarked, upIdx] = this.matchUserSelectedVcs(marked, vcs);
      const groupCount = new Map<string, number>();
      //TODO instanceof fails in some cases, need to check how to fix it
      if (Object.keys(pd).includes('input_descriptors')) {
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
      this.updatePresentationSubmissionPathToAlias('verifiableCredential');
      return this._client.presentationSubmission;
    }
    const marked: HandlerCheckResult[] = this._client.results.filter(
      (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== Status.ERROR
    );
    const updatedIndexes = this.matchUserSelectedVcs(marked, vcs);
    this.updatePresentationSubmission(updatedIndexes[1]);
    this.updatePresentationSubmissionPathToAlias('verifiableCredential');
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
    level: number
  ): [number, HandlerCheckResult[]] {
    let total = 0;
    const result: HandlerCheckResult[] = [];
    for (const sr of submissionRequirement) {
      if (sr.from) {
        if (sr.rule === Rules.All) {
          const [count, matched] = this.countMatchingInputDescriptors(sr, marked);
          if (count !== groupCount.get(sr.from)) {
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
      selectResults.verifiableCredential?.forEach((selectableCredential: IVerifiableCredential) => {
        const foundIndex: number = wrappedVcs.findIndex((wrappedVc) => JSON.stringify(selectableCredential) === JSON.stringify(wrappedVc.original));
        if (foundIndex === -1) {
          throw new Error('index is not right');
        }
        selectResults.vcIndexes?.push(foundIndex);
      });
    }
  }

  public determineAreRequiredCredentialsPresent(
    matchSubmissionRequirements: SubmissionRequirementMatch[] | undefined,
    parentMsr?: SubmissionRequirementMatch
  ): Status {
    let status = Status.INFO;
    if (!matchSubmissionRequirements || !matchSubmissionRequirements.length) {
      return Status.ERROR;
    }
    if (!parentMsr) {
      const childStatuses = [];
      for (const m of matchSubmissionRequirements) {
        childStatuses.push(this.determineSubmissionRequirementStatus(m));
      }
      if (childStatuses.filter((status) => status === Status.ERROR).length) {
        return Status.ERROR;
      } else if (childStatuses.filter((status) => status === Status.WARN).length) {
        return Status.WARN;
      } else {
        return Status.INFO;
      }
    } else {
      const childStatuses = [];
      for (const m of matchSubmissionRequirements) {
        childStatuses.push(this.determineSubmissionRequirementStatus(m));
      }
      if (parentMsr.rule === Rules.All && childStatuses.filter((status) => status === Status.ERROR).length) {
        return Status.ERROR;
      }
      const nonErrStatCount = childStatuses.filter((status) => status !== Status.ERROR).length;
      if (parentMsr.count && parentMsr.count < nonErrStatCount) {
        return Status.ERROR;
      } else if (parentMsr.count && parentMsr.count > nonErrStatCount) {
        status = Status.WARN;
      } else if (parentMsr.min && parentMsr.min > nonErrStatCount) {
        return Status.ERROR;
      } else if (parentMsr.max && parentMsr.max < nonErrStatCount) {
        status = Status.WARN;
      }
    }
    return status;
  }

  private determineSubmissionRequirementStatus(m: SubmissionRequirementMatch): Status {
    let innerStatus = Status.INFO;
    if (m.from && m.from_nested) {
      throw new Error('Invalid submission_requirement object: MUST contain either a from or from_nested property.');
    }
    if (!m.from && !m.from_nested && m.vc_path.length !== 1) {
      innerStatus = Status.ERROR;
    }
    if (m.from) {
      if (m.rule === Rules.All && m.vc_path.length !== 1) {
        innerStatus = Status.ERROR;
      }
      if (m.rule === Rules.Pick) {
        if (m.vc_path.length == 0 && (!m.from_nested || m.from_nested.length == 0)) {
          innerStatus = Status.ERROR;
        } else if (m.count && m.vc_path.length < m.count && (!m.from_nested || !m.from_nested?.length)) {
          innerStatus = Status.ERROR;
        } else if (m.count && (m.vc_path.length > m.count || (m.from_nested && m.from_nested?.length > m.count))) {
          innerStatus = Status.WARN;
        } else if (m.min && m.vc_path.length < m.min && m.from_nested && !m.from_nested?.length) {
          innerStatus = Status.ERROR;
        } else if (m.max && (m.vc_path.length > m.max || (m.from_nested && m.from_nested?.length > m.max))) {
          innerStatus = Status.WARN;
        } else if (m.rule === Rules.All && m.vc_path.length > 1) {
          innerStatus = Status.ERROR;
        }
      }
    } else if (m.from_nested) {
      innerStatus = this.determineAreRequiredCredentialsPresent(m.from_nested, m);
    }
    return innerStatus;
  }

  private updateSubmissionRequirementMatchPathToAlias(submissionRequirementMatch: SubmissionRequirementMatch, alias: string) {
    const vc_path: string[] = [];
    submissionRequirementMatch.vc_path.forEach((m) => {
      vc_path.push(m.replace('$', '$.' + alias));
    });
    submissionRequirementMatch.vc_path = vc_path;
    if (submissionRequirementMatch.from_nested) {
      submissionRequirementMatch.from_nested.forEach((f) => {
        this.updateSubmissionRequirementMatchPathToAlias(f, alias);
      });
    }
  }

  private updatePresentationSubmissionPathToAlias(alias: string, presentationSubmission?: PresentationSubmission) {
    if (presentationSubmission) {
      presentationSubmission.descriptor_map.forEach((d) => {
        this.replacePathWithAlias(d, alias);
      });
    } else if (this._client.generatePresentationSubmission) {
      this._client.presentationSubmission.descriptor_map.forEach((d) => {
        this.replacePathWithAlias(d, alias);
      });
    }
  }

  private replacePathWithAlias(descriptor: Descriptor, alias: string) {
    descriptor.path = descriptor.path.replace('$', '$.' + alias);
    if (descriptor.path_nested) {
      this.replacePathWithAlias(descriptor.path_nested, alias);
    }
  }

  private createVcToIdMap(marked: HandlerCheckResult[]): Map<string, string[]> {
    const partitionedResults: Map<string, string[]> = new Map<string, string[]>();

    const partitionedBasedOnVc: Map<string, HandlerCheckResult[]> = new Map<string, HandlerCheckResult[]>();
    for (let i = 0; i < marked.length; i++) {
      const currentVcPath: string = marked[i].verifiable_credential_path;
      if (partitionedBasedOnVc.has(currentVcPath)) {
        const partBasedOnVc = partitionedBasedOnVc.get(currentVcPath);
        if (partBasedOnVc) {
          partBasedOnVc.push(marked[i]);
        }
      } else {
        partitionedBasedOnVc.set(currentVcPath, [marked[i]]);
      }
    }

    for (const [idPath, sameVcCheckResults] of partitionedBasedOnVc.entries()) {
      const idPaths: string[] = [];
      for (let i = 0; i < sameVcCheckResults.length; i++) {
        if (idPaths.indexOf(sameVcCheckResults[i].input_descriptor_path) === -1) {
          idPaths.push(sameVcCheckResults[i].input_descriptor_path);
        }
      }
      partitionedResults.set(idPath, idPaths);
    }
    return partitionedResults;
  }
}
