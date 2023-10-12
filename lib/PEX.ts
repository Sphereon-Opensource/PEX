import {
  Format,
  PresentationDefinitionV1,
  PresentationDefinitionV2,
  PresentationSubmission
} from '@sphereon/pex-models';
import {
  CredentialMapper,
  ICredentialSubject,
  IPresentation,
  IProof,
  OriginalVerifiableCredential,
  OriginalVerifiablePresentation,
  W3CVerifiablePresentation,
  WrappedVerifiableCredential,
  WrappedVerifiablePresentation
} from '@sphereon/ssi-types';
import { W3CVerifiableCredential } from '@sphereon/ssi-types/src/types/vc';

import { Status } from './ConstraintUtils';
import { EvaluationClientWrapper, EvaluationResults, SelectResults } from './evaluation';
import {
  PresentationConstruction,
  PresentationFromOpts,
  PresentationResult,
  PresentationResultType,
  PresentationSignCallBackParams,
  PresentationSubmissionLocation,
  VerifiablePresentationFromOpts,
  VerifiablePresentationResult
} from './signing';
import {
  DiscoveredVersion,
  IInternalPresentationDefinition,
  IPresentationDefinition,
  PEVersion,
  SSITypesBuilder
} from './types';
import { definitionVersionDiscovery } from './utils';
import {
  PresentationDefinitionV1VB,
  PresentationDefinitionV2VB,
  PresentationSubmissionVB,
  Validated,
  ValidationEngine
} from './validation';

/**
 * This is the main interfacing class to be used by developers using the PEX library.
 */
export class PEX {
  protected _evaluationClientWrapper: EvaluationClientWrapper;

  constructor() {
    // TODO:  So we have state in the form of this property which is set in the constructor, but we are overwriting it elsewhere. We need to retrhink how to instantiate PEX
    this._evaluationClientWrapper = new EvaluationClientWrapper();
  }

  /***
   * The evaluatePresentation compares what is expected from a presentation with a presentationDefinition.
   * presentationDefinition: It can be either v1 or v2 of presentationDefinition
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param presentation the presentation which has to be evaluated in comparison of the definition.
   * @param opts - limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the presentation.
   */
  public evaluatePresentation(
    presentationDefinition: IPresentationDefinition,
    presentation: OriginalVerifiablePresentation | IPresentation | (OriginalVerifiablePresentation | IPresentation)[],
    opts?: {
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
      presentationSubmission?: PresentationSubmission;
      generatePresentationSubmission?: boolean;
    }
  ): EvaluationResults[] {
    const generatePresentationSubmission =
      opts?.generatePresentationSubmission !== undefined ? opts.generatePresentationSubmission : opts?.presentationSubmission === undefined;
    const pd: IInternalPresentationDefinition = SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
    const presentationCopy: OriginalVerifiablePresentation| OriginalVerifiablePresentation[] = JSON.parse(JSON.stringify(presentation));
    const presentations = Array.isArray(presentationCopy) ? presentationCopy : [presentationCopy]
    const wrappedPresentations: WrappedVerifiablePresentation[] = presentations.map(presentation => SSITypesBuilder.mapExternalVerifiablePresentationToWrappedVP(presentation));
    const presentationSubmission = opts?.presentationSubmission ?? wrappedPresentations.find(presentation => presentation.presentation.presentation_submission !== undefined)?.presentation?.presentation_submission;
    if (!presentationSubmission && !generatePresentationSubmission) {
      throw Error(`Either a presentation submission as part of the VP or provided separately was expected`);
    }
    const results: EvaluationResults[] =[]

    wrappedPresentations.forEach(wrappedPresentation => {
      const holderDIDs = wrappedPresentation.presentation.holder ? [wrappedPresentation.presentation.holder] : [];
      const updatedOpts = {
        ...opts,
        holderDIDs,
        presentationSubmission,
        generatePresentationSubmission
      };

      const result: EvaluationResults = this._evaluationClientWrapper.evaluate(pd, wrappedPresentation.vcs, updatedOpts);
      if (result.value?.descriptor_map.length) {
        const selectFromClientWrapper = new EvaluationClientWrapper();
        const selectResults: SelectResults = selectFromClientWrapper.selectFrom(pd, wrappedPresentation.vcs, updatedOpts);
        if (selectResults.areRequiredCredentialsPresent !== Status.ERROR) {
          result.errors = [];
        }
      }
      results.push(result)
    })
  /*  if (results.length === 1) {
      return results[0]
    }
*/
    return results;
  }

  /***
   * The evaluate compares what is expected from a verifiableCredentials with the presentationDefinition.
   *
   * @param presentationDefinition the v1 or v2 definition of what is expected in the presentation.
   * @param verifiableCredentials the verifiable credentials which are candidates to fulfill requirements defined in the presentationDefinition param.
   * @param opts - holderDIDs the list of the DIDs that the wallet holders controls. Optional, but needed by some input requirements that do a holderDID check.
   * @           - limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the verifiable credentials.
   */
  public evaluateCredentials(
    presentationDefinition: IPresentationDefinition,
    verifiableCredentials: OriginalVerifiableCredential[],
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
    }
  ): EvaluationResults {
    const wrappedVerifiableCredentials: WrappedVerifiableCredential[] =
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentials);

    // TODO:  So we have state in the form of this property which is set in the constructor, but we are overwriting it here. We need to retrhink how to instantiate PEX
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    const pd: IInternalPresentationDefinition = SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
    const result = this._evaluationClientWrapper.evaluate(pd, wrappedVerifiableCredentials, opts);
    if (result.value && result.value.descriptor_map.length) {
      const selectFromClientWrapper = new EvaluationClientWrapper();
      const selectResults: SelectResults = selectFromClientWrapper.selectFrom(pd, wrappedVerifiableCredentials, opts);
      result.areRequiredCredentialsPresent = selectResults.areRequiredCredentialsPresent;
      result.errors = selectResults.errors;
    } else {
      result.areRequiredCredentialsPresent = Status.ERROR;
    }
    return result;
  }

  /**
   * The selectFrom method is a helper function that helps filter out the verifiable credentials which can not be selected and returns
   * the selectable credentials.
   *
   * @param presentationDefinition the v1 or v2 definition of what is expected in the presentation.
   * @param verifiableCredentials verifiable credentials are the credentials from wallet provided to the library to find selectable credentials.
   * @param opts - holderDIDs the decentralized identifier(s) of the wallet holderDID. This is used to identify the credentials issued to the holderDID of wallet in certain scenario's.
   *             - limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the selectable credentials.
   */
  public selectFrom(
    presentationDefinition: IPresentationDefinition,
    verifiableCredentials: OriginalVerifiableCredential[],
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
    }
  ): SelectResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    const pd: IInternalPresentationDefinition = SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
    // TODO:  So we have state in the form of this property which is set in the constructor, but we are overwriting it here. We need to retrhink how to instantiate PEX
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.selectFrom(pd, SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentialCopy), opts);
  }

  public presentationSubmissionFrom(
    presentationDefinition: IPresentationDefinition,
    selectedCredentials: OriginalVerifiableCredential[],
    opts?: {
      /**
       * The presentation submission data location.
       *
       * Can be External, which means it is only returned and not embedded into the VP,
       * or Presentation, which means it will become part of the VP
       */
      presentationSubmissionLocation?: PresentationSubmissionLocation;
    }
  ): PresentationSubmission {
    const pd: IInternalPresentationDefinition = SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
    return this._evaluationClientWrapper.submissionFrom(pd, SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(selectedCredentials), opts);
  }

  /**
   * This method helps create an Unsigned Presentation. An Unsigned Presentation after signing becomes a Presentation. And can be sent to
   * the verifier after signing it.
   *
   * @param presentationDefinition the v1 or v2 definition of what is expected in the presentation.
   * @param selectedCredentials the credentials which were declared selectable by getSelectableCredentials and then chosen by the intelligent-user
   * (e.g. human).
   * @param opts - holderDID optional; the decentralized identity of the wallet holderDID. This is used to identify the holderDID of the presentation.
   *
   * @return the presentation.
   */
  public presentationFrom(
    presentationDefinition: IPresentationDefinition,
    selectedCredentials: OriginalVerifiableCredential[],
    opts?: PresentationFromOpts<Partial<IPresentation>|Partial<IPresentation>[]>
  ): PresentationResult {
    const presentationSubmissionLocation = opts?.presentationSubmissionLocation ?? PresentationSubmissionLocation.PRESENTATION;
    const presentationSubmission = this.presentationSubmissionFrom(presentationDefinition, selectedCredentials, opts);
    const presentation = PEX.constructPresentations(selectedCredentials, {
      ...opts,
      presentationSubmission: presentationSubmissionLocation === PresentationSubmissionLocation.PRESENTATION ? presentationSubmission : undefined
    });
    return {
      presentation,
      presentationSubmissionLocation,
      presentationSubmission
    };
  }


  public static constructPresentations(selectedCredentials: OriginalVerifiableCredential | OriginalVerifiableCredential[],
                                       opts?: PresentationFromOpts<Partial<IPresentation>|Partial<IPresentation>[]> & { presentationSubmission?: PresentationSubmission }) {

    const buildConstructions = (
      vc: WrappedVerifiableCredential,
      constructions: Record<string, PresentationConstruction>,
      opts?: PresentationFromOpts<Partial<IPresentation> | Partial<IPresentation>[]>) => {
      if (opts?.presentationFormat && Object.keys(opts.presentationFormat).length > 1) {
        throw Error(`Connot use more than one format when creating a VP currently: ${JSON.stringify(opts.presentationFormat)}`);
      }
      const subjects = Array.isArray(vc.credential.credentialSubject) ? vc.credential.credentialSubject : [vc.credential.credentialSubject];
      const presentationSubmissionLocation = opts?.presentationSubmissionLocation ?? PresentationSubmissionLocation.PRESENTATION;
      const presentationResultType = opts?.presentationResultType ?? PresentationResultType.VP_FORMAT_BASED;
      const presentationFormat: Format | undefined = opts?.presentationFormat;

      subjects.forEach(subject => {
        const holderDID = subject.id ?? opts?.holderDID;

        if (!holderDID) {
          throw Error(`No subject id found or holderDID supplied. Cannot create a Presentation without this information: ${JSON.stringify(vc.credential)}`);
        }
        let construction: PresentationConstruction;
        if (!Object.keys(constructions).includes(holderDID)) {
          construction = {
            presentationFormat,
            presentationResultType,
            credentials: new Set(),
            holderDID,
            presentationSubmissionLocation,
            jwtVCCount: 0,
            ldpVCCount: 0
          };
          constructions[holderDID] = construction;
        } else {
          construction = constructions[holderDID]!;
        }
        if (vc.format.includes('jwt')) {
          construction.jwtVCCount++;
        } else {
          construction.ldpVCCount++;
        }
        construction.credentials.add(vc.original);
      });
    };


    const constructionCounters = (constructions: Record<string, PresentationConstruction>) => {
      let jwtCnt = 0;
      let ldpCnt = 0;
      let totalCnt = 0;
      Object.entries(constructions).forEach(([_did, construction]) => {
        const keys = construction.presentationFormat ? Object.keys(construction.presentationFormat) : [];
        const jwt = keys.find(key => key.includes('jwt'));
        const ldp = keys.find(key => key.includes('ldp'));
        totalCnt++;
        if (keys.length === 0 || (!jwt && !ldp)) {
          // we are setting the VP format based on what type of VCs we have most
          if (construction.ldpVCCount >= construction.jwtVCCount) {
            construction.presentationFormat = {
              ldp_vp: {
                proof_type: ['']
              }
            };
          }
          Array.from(construction.credentials).map(vc => CredentialMapper.toWrappedVerifiableCredential(vc));
        }

        jwt && jwtCnt++;
        ldp && ldpCnt++;
      });
      return { jwtCnt, ldpCnt, totalCnt };
    };

    const allVCs = Array.isArray(selectedCredentials) ? selectedCredentials : [selectedCredentials];
    const constructions: Record<string, PresentationConstruction> = {};
    allVCs.map(vc => CredentialMapper.toWrappedVerifiableCredential(vc)).forEach(vc => {
      buildConstructions(vc, constructions, opts);
    });

    const { totalCnt } = constructionCounters(constructions);

    if (totalCnt > 1 && opts?.presentationResultType === PresentationResultType.SINGLE_PRESENTATION) {
      if (opts.presentationFormat && Object.keys(opts.presentationFormat).find(format => format.includes('jwt'))) {
        throw Error(`Impossible combination. ${totalCnt} different holder DIDs found, but mode is single presentation using JWTs. `);
      }
      // Put everything into one presentation
      return [PEX.constructPresentationImpl(selectedCredentials, opts)];
    }
    const results = Object.entries(constructions).map(([holderDID, construction]) => {
      return PEX.constructPresentationImpl(Array.from(construction.credentials), { ...opts, holderDID });
    });
    return results;
  }

  public static constructPresentation(
    selectedCredentials: OriginalVerifiableCredential | OriginalVerifiableCredential[],
    opts?: PresentationFromOpts<Partial<IPresentation>> & { presentationSubmission?: PresentationSubmission }
  ): IPresentation {
    return PEX.constructPresentations(selectedCredentials, opts)[0]
  }

  static constructPresentationImpl(
    selectedCredentials: OriginalVerifiableCredential | OriginalVerifiableCredential[],
    opts?: PresentationFromOpts<Partial<IPresentation>> & { presentationSubmission?: PresentationSubmission }
  ): IPresentation {
    const vcs = Array.isArray(selectedCredentials) ? selectedCredentials : [selectedCredentials];
    const holderDIDs = Array.from(new Set(vcs.map(vc => CredentialMapper.toWrappedVerifiableCredential(vc)).flatMap((vc: WrappedVerifiableCredential) => vc.credential.credentialSubject).map((subject: ICredentialSubject) => subject.id).filter(id => id !== undefined)));
    let holder = opts?.holderDID ?? opts?.basePresentationPayload?.holder;

    const formatKeys = opts?.presentationFormat && Object.keys(opts.presentationFormat);
    if (!holder && holderDIDs.length > 1) {
      if (opts?.presentationResultType === PresentationResultType.MULTIPLE_PRESENTATIONS) {
        throw Error('Please call constructPresentations() instead to create multiple presentations from input credentials');
      } else if (formatKeys?.includes('jwt') && opts?.presentationResultType === PresentationResultType.VP_FORMAT_BASED) {
        throw Error('Please call constructPresentations() instead to create multiple presentations from input credentials');
      }
    }
    if (holder && holderDIDs.length > 0 && !holderDIDs.includes(holder)) {
      console.log(`Holder DID ${holder} for VP is different from some VC subject IDs (${JSON.stringify(holderDIDs)}) being used in the VP. This typically isn't intended`);
    }
    if (formatKeys?.includes('jwt') && holderDIDs.length > 1) {
      // todo: Would not apply to SD-JWT
      if (!holder) {
        throw Error(`Cannot sign a single JWT when no holder is supplied and multiple credential subject DIDs are found ${JSON.stringify(holderDIDs)}`);
      } else {
        console.log(`JWT presentation format is used, multiple DIDs are found in credential subjects (${JSON.stringify(holderDIDs)}, but signing single VP with ${holder})`);
      }
    }
    if (holderDIDs.length === 1 && !holder) {
      holder = holderDIDs[0];
    }

    let type: string[] = [];
    if (opts?.basePresentationPayload?.type) {
      if (Array.isArray(opts.basePresentationPayload.type)) {
        type = opts.basePresentationPayload.type;
      } else {
        type = [opts.basePresentationPayload.type];
      }
    }
    const context = opts?.basePresentationPayload?.['@context']
      ? Array.isArray(opts.basePresentationPayload['@context'])
        ? opts.basePresentationPayload['@context']
        : [opts.basePresentationPayload['@context']]
      : [];
    if (!context.includes('https://www.w3.org/2018/credentials/v1')) {
      context.push('https://www.w3.org/2018/credentials/v1');
    }

    if (!type.includes('VerifiablePresentation')) {
      type.push('VerifiablePresentation');
    }
    if (opts?.presentationSubmissionLocation !== PresentationSubmissionLocation.EXTERNAL && opts?.presentationSubmission) {
      if (!type.includes('PresentationSubmission')) {
        type.push('PresentationSubmission');
      }
      if (!context.includes('https://identity.foundation/presentation-exchange/submission/v1')) {
        context.push('https://identity.foundation/presentation-exchange/submission/v1');
      }
    }

    return {
      ...opts?.basePresentationPayload,
      '@context': context,
      type,
      holder,
      ...(!!opts?.presentationSubmission && { presentation_submission: opts.presentationSubmission }),
      verifiableCredential: (Array.isArray(selectedCredentials) ? selectedCredentials : [selectedCredentials]) as W3CVerifiableCredential[]
    };
  }

  /**
   * This method validates whether an object is usable as a presentation definition or not.
   *
   * @param presentationDefinition presentationDefinition of V1 or v2 to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation definition
   */
  public static validateDefinition(presentationDefinition: IPresentationDefinition): Validated {
    const result = definitionVersionDiscovery(presentationDefinition);
    if (result.error) {
      throw new Error(result.error);
    }
    const validators = [];
    result.version === PEVersion.v1
      ? validators.push({
        bundler: new PresentationDefinitionV1VB('root'),
        target: SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition as PresentationDefinitionV1)
      })
      : validators.push({
        bundler: new PresentationDefinitionV2VB('root'),
        target: SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(presentationDefinition as PresentationDefinitionV2)
      });
    return new ValidationEngine().validate(validators);
  }

  /**
   * This method validates whether an object is usable as a presentation submission or not.
   *
   * @param presentationSubmission the object to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation submission
   */
  public static validateSubmission(presentationSubmission: PresentationSubmission): Validated {
    return new ValidationEngine().validate([
      {
        bundler: new PresentationSubmissionVB('root'),
        target: presentationSubmission
      }
    ]);
  }

  /**
   * This method can be used to combine a definition, selected Verifiable Credentials, together with
   * signing opts and a callback to sign a presentation, making it a Verifiable Presentation before sending.
   *
   * Please note that PEX has no signature support on purpose. We didn't want this library to depend on all kinds of signature suites.
   * The callback function next to the Signing Params also gets a Presentation which is evaluated against the definition.
   * It is up to you to decide whether you simply update the supplied partial proof and add it to the presentation in the callback,
   * or whether you will use the selected Credentials, Presentation definition, evaluation results and/or presentation submission together with the signature opts
   *
   * @param presentationDefinition the Presentation Definition V1 or V2
   * @param selectedCredentials the PEX and/or User selected/filtered credentials that will become part of the Verifiable Presentation
   * @param signingCallBack the function which will be provided as a parameter. And this will be the method that will be able to perform actual
   *        signing. One example of signing is available in the project named. pe-selective-disclosure.
   * @param opts Signing Params these are the signing params required to sign.
   *
   * @return the signed and thus Verifiable Presentation.
   */
  public async verifiablePresentationFrom(
    presentationDefinition: IPresentationDefinition,
    selectedCredentials: OriginalVerifiableCredential[],
    signingCallBack: (callBackParams: PresentationSignCallBackParams) => Promise<W3CVerifiablePresentation> | W3CVerifiablePresentation,
    opts: VerifiablePresentationFromOpts
  ): Promise<VerifiablePresentationResult> {
    const { holderDID, signatureOptions, proofOptions } = opts;

    const presentationSubmissionLocation = opts.presentationSubmissionLocation ?? PresentationSubmissionLocation.PRESENTATION;
    const updatedOpts = { ...opts, presentationSubmissionLocation };
    if (Array.isArray(opts.))

    function limitedDisclosureSuites() {
      let limitDisclosureSignatureSuites: string[] = [];
      if (proofOptions?.typeSupportsSelectiveDisclosure) {
        if (!proofOptions?.type) {
          throw Error('Please provide a proof type if you enable selective disclosure');
        }
        limitDisclosureSignatureSuites = [proofOptions.type];
      }
      return limitDisclosureSignatureSuites;
    }

    const holderDIDs: string[] = holderDID ? [holderDID] : [];
    const limitDisclosureSignatureSuites = limitedDisclosureSuites();
    const evaluationResult = this.evaluateCredentials(presentationDefinition, selectedCredentials, {
      holderDIDs,
      limitDisclosureSignatureSuites
    });

    const presentationResult = this.presentationFrom(presentationDefinition, evaluationResult.verifiableCredential, updatedOpts);
    const evaluationResults = this.evaluatePresentation(presentationDefinition, presentationResult.presentation, {
      limitDisclosureSignatureSuites,
      ...(presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL && {
        presentationSubmission: presentationResult.presentationSubmission
      })
    });
    if (evaluationResults.some(result => !result.value)) {
      throw new Error('Could not get evaluation results from presentationResult');
    }
    if (evaluationResults.length > 1) {
      if (signatureOptions?.jws || signatureOptions?.proofValue) {
        throw Error(`Multiple presentations need to be signed. That is impossible with a single JWS or ProofValue`)
      }
    }

    const proof: Partial<IProof> = {
      type: proofOptions?.type,
      verificationMethod: signatureOptions?.verificationMethod,
      created: proofOptions?.created ? proofOptions.created : new Date().toISOString(),
      proofPurpose: proofOptions?.proofPurpose,
      ...(signatureOptions?.proofValue && {proofValue: signatureOptions.proofValue}),
      ...(signatureOptions?.jws && {jws: signatureOptions.jws}),
      challenge: proofOptions?.challenge,
      nonce: proofOptions?.nonce,
      domain: proofOptions?.domain
    };

    const callBackParams: PresentationSignCallBackParams = {
      options: updatedOpts,
      presentation: presentationResult.presentation,
      presentationDefinition,
      selectedCredentials,
      proof,
      presentationSubmission: evaluationResults.value,
      evaluationResults
    };
    const verifiablePresentation = await signingCallBack(callBackParams);

    return {
      verifiablePresentation,
      presentationSubmissionLocation,
      presentationSubmission: evaluationResults.value
    };
  }

  public static definitionVersionDiscovery(presentationDefinition: IPresentationDefinition): DiscoveredVersion {
    return definitionVersionDiscovery(presentationDefinition);
  }
}
