import { Format, PresentationDefinitionV1, PresentationDefinitionV2, PresentationSubmission } from '@sphereon/pex-models';
import {
  CompactSdJwtVc,
  CredentialMapper,
  Hasher,
  ICredential,
  IPresentation,
  IProof,
  OriginalVerifiableCredential,
  OriginalVerifiablePresentation,
  OrPromise,
  SdJwtDecodedVerifiableCredential,
  W3CVerifiableCredential,
  W3CVerifiablePresentation,
  WrappedVerifiableCredential,
  WrappedVerifiablePresentation,
} from '@sphereon/ssi-types';

import { Status } from './ConstraintUtils';
import { EvaluationClientWrapper, EvaluationResults, SelectResults } from './evaluation';
import {
  PresentationFromOpts,
  PresentationResult,
  PresentationSignCallBackParams,
  PresentationSubmissionLocation,
  SdJwtDecodedVerifiableCredentialWithKbJwtInput,
  SdJwtKbJwtInput,
  VerifiablePresentationFromOpts,
  VerifiablePresentationResult,
} from './signing';
import { DiscoveredVersion, IInternalPresentationDefinition, IPresentationDefinition, PEVersion, SSITypesBuilder } from './types';
import { calculateSdHash, definitionVersionDiscovery, getSubjectIdsAsString } from './utils';
import { PresentationDefinitionV1VB, PresentationDefinitionV2VB, PresentationSubmissionVB, Validated, ValidationEngine } from './validation';

export interface PEXOptions {
  /**
   * Hasher implementation, can be used for tasks such as decoding a compact SD-JWT VC to it's encoded variant.
   * When decoding SD-JWT credentials the hasher must be provided. The hasher implementation must be sync. When using
   * an async hasher implementation, you must manually decode the credential or presentation first according to the
   * `SdJwtDecodedVerifiableCredential` interface. You can use the `CredentialMapper.decodeSdJwtAsync` method for
   *  this from the `@sphereon/ssi-types` package. NOTE that this is only needed when using an async hasher, and
   * that for sync hashers providing it here is enough for the decoding to be done automatically.
   */
  hasher?: Hasher;
}

/**
 * This is the main interfacing class to be used by developers using the PEX library.
 */
export class PEX {
  protected _evaluationClientWrapper: EvaluationClientWrapper;
  protected options?: PEXOptions;

  constructor(options?: PEXOptions) {
    // TODO:  So we have state in the form of this property which is set in the constructor, but we are overwriting it elsewhere. We need to retrhink how to instantiate PEX
    this._evaluationClientWrapper = new EvaluationClientWrapper();

    this.options = options;
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
    presentation: OriginalVerifiablePresentation | IPresentation,
    opts?: {
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
      presentationSubmission?: PresentationSubmission;
      generatePresentationSubmission?: boolean;
    },
  ): EvaluationResults {
    const generatePresentationSubmission =
      opts?.generatePresentationSubmission !== undefined ? opts.generatePresentationSubmission : opts?.presentationSubmission === undefined;
    const pd: IInternalPresentationDefinition = SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
    const presentationCopy: OriginalVerifiablePresentation = JSON.parse(JSON.stringify(presentation));
    const wrappedPresentation: WrappedVerifiablePresentation = SSITypesBuilder.mapExternalVerifiablePresentationToWrappedVP(
      presentationCopy,
      this.options?.hasher,
    );
    const presentationSubmission = opts?.presentationSubmission ?? wrappedPresentation.decoded.presentation_submission;
    if (!presentationSubmission && !generatePresentationSubmission) {
      throw Error(`Either a presentation submission as part of the VP or provided separately was expected`);
    }

    // TODO: we should probably add support for holder dids in the kb-jwt of an SD-JWT. We can extract this from the
    // `wrappedPresentation.original.compactKbJwt`, but as HAIP doesn't use dids, we'll leave it for now.
    const holderDIDs =
      CredentialMapper.isW3cPresentation(wrappedPresentation.presentation) && wrappedPresentation.presentation.holder
        ? [wrappedPresentation.presentation.holder]
        : [];

    const updatedOpts = {
      ...opts,
      holderDIDs,
      presentationSubmission,
      generatePresentationSubmission,
    };

    const result: EvaluationResults = this._evaluationClientWrapper.evaluate(pd, wrappedPresentation.vcs, updatedOpts);
    if (result.value?.descriptor_map.length) {
      const selectFromClientWrapper = new EvaluationClientWrapper();
      const selectResults: SelectResults = selectFromClientWrapper.selectFrom(pd, wrappedPresentation.vcs, updatedOpts);
      if (selectResults.areRequiredCredentialsPresent !== Status.ERROR) {
        result.errors = [];
      }
    }
    return result;
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
    },
  ): EvaluationResults {
    const wrappedVerifiableCredentials: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(
      verifiableCredentials,
      this.options?.hasher,
    );

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
    },
  ): SelectResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    const pd: IInternalPresentationDefinition = SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
    // TODO:  So we have state in the form of this property which is set in the constructor, but we are overwriting it here. We need to retrhink how to instantiate PEX
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.selectFrom(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentialCopy, this.options?.hasher),
      opts,
    );
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
    },
  ): PresentationSubmission {
    const pd: IInternalPresentationDefinition = SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
    return this._evaluationClientWrapper.submissionFrom(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(selectedCredentials, this.options?.hasher),
      opts,
    );
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
    opts?: PresentationFromOpts,
  ): PresentationResult {
    const presentationSubmission = this.presentationSubmissionFrom(presentationDefinition, selectedCredentials, opts);
    const hasSdJwtCredentials = selectedCredentials.some((c) => CredentialMapper.isSdJwtDecodedCredential(c) || CredentialMapper.isSdJwtEncoded(c));

    // We could include it in the KB-JWT? Not sure if we want that
    if (opts?.presentationSubmissionLocation === PresentationSubmissionLocation.PRESENTATION && hasSdJwtCredentials) {
      throw new Error('Presentation submission location cannot be set to presentation when creating a presentation with an SD-JWT VC');
    }

    const presentationSubmissionLocation =
      opts?.presentationSubmissionLocation ??
      (hasSdJwtCredentials ? PresentationSubmissionLocation.EXTERNAL : PresentationSubmissionLocation.PRESENTATION);

    const presentation = PEX.constructPresentation(selectedCredentials, {
      ...opts,
      // We only pass in the submission in case it needs to be included in the presentation
      presentationSubmission: presentationSubmissionLocation === PresentationSubmissionLocation.PRESENTATION ? presentationSubmission : undefined,
      hasher: this.options?.hasher,
    });

    return {
      presentation,
      presentationSubmissionLocation,
      presentationSubmission,
    };
  }

  public static constructPresentation(
    selectedCredentials: OriginalVerifiableCredential | OriginalVerifiableCredential[],
    opts?: {
      presentationSubmission?: PresentationSubmission;
      holderDID?: string;
      basePresentationPayload?: IPresentation;
      /**
       * Hasher to use when decoding an SD-JWT credential.
       */
      hasher?: Hasher;
    },
  ): IPresentation | SdJwtDecodedVerifiableCredentialWithKbJwtInput {
    const credentials = Array.isArray(selectedCredentials) ? selectedCredentials : [selectedCredentials];

    // for SD-JWT we want to return the SD-JWT with only the needed disclosures (so filter disclosures array, and update the compactSdJwt)
    // in addition we want to create the KB-JWT payload as well.
    // FIXME: include the KB-JWT payload?
    if (credentials.some((c) => CredentialMapper.isSdJwtDecodedCredential(c) || CredentialMapper.isSdJwtEncoded(c))) {
      if (credentials.length > 1) {
        // Until there's some consensus around the following issue, we'll only support a single
        // SD-JWT credential in a presentation
        // https://github.com/decentralized-identity/presentation-exchange/issues/462
        throw new Error('Only a single credential is supported when creating a presentation with an SD-JWT VC');
      }

      if (opts?.presentationSubmission) {
        throw new Error('Presentation submission cannot be included in the presentation when creating a presentation with an SD-JWT VC');
      }

      if (opts?.basePresentationPayload) {
        throw new Error('Base presentation payload cannot be when creating a presentation from an SD-JWT VC');
      }

      // NOTE: we assume the credential already has selective disclosure applied, even if it is encoded. Is
      // that a valid assumption? It seems to be this way for BBS SD as well
      const decoded = (
        CredentialMapper.isSdJwtEncoded(credentials[0]) ? CredentialMapper.decodeVerifiableCredential(credentials[0], opts?.hasher) : credentials[0]
      ) as SdJwtDecodedVerifiableCredential;

      if (!opts?.hasher) {
        throw new Error('Hasher must be provided when creating a presentation with an SD-JWT VC');
      }

      // extract sd_alg or default to sha-256
      const hashAlg = decoded.signedPayload._sd_alg ?? 'sha-256';
      const sdHash = calculateSdHash(decoded.compactSdJwtVc, hashAlg, opts.hasher);

      const kbJwt = {
        // alg MUST be set by the signer
        header: {
          typ: 'kb+jwt',
        },
        // aud MUST be set by the signer or provided by e.g. SIOP/OpenID4VP lib
        payload: {
          iat: new Date().getTime(),
          _sd_hash: sdHash,
        },
      } satisfies SdJwtKbJwtInput;

      return {
        ...decoded,
        kbJwt,
      };
    } else {
      if (!selectedCredentials) {
        throw Error(`At least a verifiable credential needs to be passed in to create a presentation`);
      }
      const verifiableCredential = (Array.isArray(selectedCredentials) ? selectedCredentials : [selectedCredentials]) as W3CVerifiableCredential[];
      const wVCs = verifiableCredential.map((vc) => CredentialMapper.toWrappedVerifiableCredential(vc));
      const holders = Array.from(new Set(wVCs.flatMap((wvc) => getSubjectIdsAsString(wvc.credential as ICredential))));
      if (holders.length !== 1 && !opts?.holderDID) {
        console.log(
          `We deduced ${holders.length} subject from ${wVCs.length} Verifiable Credentials, and no holder property was given. This might lead to undesired results`,
        );
      }
      const holder = opts?.holderDID ?? (holders.length === 1 ? holders[0] : undefined);

      const type = opts?.basePresentationPayload?.type
        ? Array.isArray(opts.basePresentationPayload.type)
          ? opts.basePresentationPayload.type
          : [opts.basePresentationPayload.type]
        : [];
      if (!type.includes('VerifiablePresentation')) {
        type.push('VerifiablePresentation');
      }

      const context = opts?.basePresentationPayload?.['@context']
        ? Array.isArray(opts.basePresentationPayload['@context'])
          ? opts.basePresentationPayload['@context']
          : [opts.basePresentationPayload['@context']]
        : [];
      if (!context.includes('https://www.w3.org/2018/credentials/v1')) {
        context.push('https://www.w3.org/2018/credentials/v1');
      }

      if (opts?.presentationSubmission) {
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
        verifiableCredential,
      };
    }
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
          target: SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition as PresentationDefinitionV1),
        })
      : validators.push({
          bundler: new PresentationDefinitionV2VB('root'),
          target: SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(presentationDefinition as PresentationDefinitionV2),
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
        target: presentationSubmission,
      },
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
    signingCallBack: (callBackParams: PresentationSignCallBackParams) => OrPromise<W3CVerifiablePresentation | CompactSdJwtVc>,
    opts: VerifiablePresentationFromOpts,
  ): Promise<VerifiablePresentationResult> {
    const { holderDID, signatureOptions, proofOptions } = opts;

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
      limitDisclosureSignatureSuites,
    });

    const presentationResult = this.presentationFrom(presentationDefinition, evaluationResult.verifiableCredential, opts);
    const evaluationResults = this.evaluatePresentation(presentationDefinition, presentationResult.presentation, {
      limitDisclosureSignatureSuites,
      ...(presentationResult.presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL && {
        presentationSubmission: presentationResult.presentationSubmission,
      }),
    });
    if (!evaluationResults.value && selectedCredentials.length === 0) {
      evaluationResults.value = presentationResult.presentationSubmission;
    }
    if (!evaluationResults.value) {
      throw new Error('Could not get evaluation results from presentationResult');
    }

    const proof: Partial<IProof> = {
      type: proofOptions?.type,
      verificationMethod: signatureOptions?.verificationMethod,
      created: proofOptions?.created ? proofOptions.created : new Date().toISOString(),
      proofPurpose: proofOptions?.proofPurpose,
      proofValue: signatureOptions?.proofValue,
      jws: signatureOptions?.jws,
      challenge: proofOptions?.challenge,
      nonce: proofOptions?.nonce,
      domain: proofOptions?.domain,
    };

    let presentation = presentationResult.presentation;

    if (CredentialMapper.isSdJwtDecodedCredential(presentationResult.presentation)) {
      if (!this.options?.hasher) {
        throw new Error('Hasher must be provided when creating a presentation with an SD-JWT VC');
      }

      // extract sd_alg or default to sha-256
      const hashAlg = presentationResult.presentation.signedPayload._sd_alg ?? 'sha-256';
      const sdHash = calculateSdHash(presentationResult.presentation.compactSdJwtVc, hashAlg, this.options.hasher);

      const kbJwt = {
        // alg MUST be set by the signer
        header: {
          typ: 'kb+jwt',
        },
        // aud MUST be set by the signer or provided by e.g. SIOP/OpenID4VP lib
        payload: {
          iat: new Date().getTime(),
          nonce: proofOptions?.nonce,
          _sd_hash: sdHash,
        },
      } satisfies SdJwtKbJwtInput;

      presentation = {
        ...presentation,
        kbJwt,
      };
    }

    const callBackParams: PresentationSignCallBackParams = {
      options: {
        ...opts,
        presentationSubmissionLocation: presentationResult.presentationSubmissionLocation,
      },
      presentation,
      presentationDefinition,
      selectedCredentials,
      proof,
      presentationSubmission: evaluationResults.value,
      evaluationResults,
    };
    const verifiablePresentation = await signingCallBack(callBackParams);

    return {
      verifiablePresentation,
      presentationSubmissionLocation: presentationResult.presentationSubmissionLocation,
      presentationSubmission: evaluationResults.value,
    };
  }

  public static definitionVersionDiscovery(presentationDefinition: IPresentationDefinition): DiscoveredVersion {
    return definitionVersionDiscovery(presentationDefinition);
  }
}
