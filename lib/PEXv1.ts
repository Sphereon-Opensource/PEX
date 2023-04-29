import { PresentationDefinitionV1, PresentationSubmission } from '@sphereon/pex-models';
import { Format } from '@sphereon/pex-models/model/format';
import { IPresentation, OriginalVerifiableCredential, OriginalVerifiablePresentation } from '@sphereon/ssi-types';

import { PEX } from './PEX';
import { EvaluationClientWrapper, EvaluationResults, SelectResults } from './evaluation';
import { PresentationFromOpts, PresentationResult, PresentationSubmissionLocation } from './signing/types';
import { SSITypesBuilder } from './types';
import { PresentationDefinitionV1VB, Validated, ValidationEngine } from './validation';

/**
 * This is the main interfacing class for using this library for v1 of presentation exchange
 */
export class PEXv1 extends PEX {
  constructor() {
    super();
  }

  /***
   * The evaluatePresentationV1 compares what is expected from a presentation with a presentationDefinitionV1.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param presentation the presentation which has to be evaluated in comparison of the definition.
   * @param opts - limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the presentation.
   */
  public evaluatePresentation(
    presentationDefinition: PresentationDefinitionV1,
    presentation: OriginalVerifiablePresentation | IPresentation,
    opts?: {
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
    }
  ): EvaluationResults {
    SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition); // only doing validation
    return super.evaluatePresentation(presentationDefinition, presentation, opts);
  }

  /***
   * To evaluate compares what is expected from a verifiableCredentials with the presentationDefinition.
   *
   * @param presentationDefinition the v1 definition of what is expected in the presentation.
   * @param verifiableCredentials the verifiable credentials which are candidates to fulfill requirements defined in the presentationDefinition param.
   * @param opts - holderDIDs the list of the DIDs that the wallet holders controlls.
   *                limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the verifiable credentials.
   */
  public evaluateCredentials(
    presentationDefinition: PresentationDefinitionV1,
    verifiableCredentials: OriginalVerifiableCredential[],
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
    }
  ): EvaluationResults {
    SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition); // only doing validation
    return super.evaluateCredentials(presentationDefinition, verifiableCredentials, opts);
  }

  /**
   * The selectFrom method is a helper function that helps filter out the verifiable credentials which can not be selected and returns
   * the selectable credentials.
   *
   * @param presentationDefinition the v1 definition of what is expected in the presentation.
   * @param verifiableCredentials verifiable credentials are the credentials from wallet provided to the library to find selectable credentials.
   * @param opts - holderDIDs the decentralized identity of the wallet holderDID. This is used to identify the credentials issued to the holderDID of wallet.
   *               limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the selectable credentials.
   */
  public selectFrom(
    presentationDefinition: PresentationDefinitionV1,
    verifiableCredentials: OriginalVerifiableCredential[],
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
    }
  ): SelectResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.selectFrom(
      SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition),
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentialCopy),
      opts
    );
  }

  /**
   * This method helps create a submittablePresentation. A submittablePresentation after signing becomes a Presentation. And can be sent to
   * the verifier after signing it.
   *
   * IMPORTANT NOTE: this method creates a presentation object based on the SELECTED verifiable credentials. You can get the selected verifiable credentials using selectFrom method
   *
   * @param presentationDefinition the v1 definition of what is expected in the presentation.
   * @param selectedCredentials the credentials which were declared selectable by getSelectableCredentials and then chosen by the intelligent-user
   * (e.g. human).
   * @param opts - holderDID optional; the decentralized identity of the wallet holderDID. This is used to identify the holderDID of the presentation.
   *
   * @return the presentation.
   */
  public presentationFrom(
    presentationDefinition: PresentationDefinitionV1,
    selectedCredentials: OriginalVerifiableCredential[],
    opts?: PresentationFromOpts
  ): PresentationResult {
    const presentationSubmissionLocation = opts?.presentationSubmissionLocation ?? PresentationSubmissionLocation.PRESENTATION;
    const presentationSubmission = this._evaluationClientWrapper.submissionFrom(
      SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition),
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(selectedCredentials)
    );
    const presentation = PEX.constructPresentation(selectedCredentials, {
      ...opts,
      presentationSubmission: presentationSubmissionLocation === PresentationSubmissionLocation.PRESENTATION ? presentationSubmission : undefined,
    });
    return {
      presentation,
      presentationSubmissionLocation,
      presentationSubmission,
    };
  }

  /**
   * This method validates whether an object is usable as a presentation definition or not.
   *
   * @param presentationDefinitionV1 the object to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation definition
   */
  public static validateDefinition(presentationDefinitionV1: PresentationDefinitionV1): Validated {
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinitionV1);
    return new ValidationEngine().validate([
      {
        bundler: new PresentationDefinitionV1VB('root'),
        target: pd,
      },
    ]);
  }

  /**
   * This method validates whether an object is usable as a presentation submission or not.
   *
   * @param presentationSubmission the object to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation submission
   */
  public static validateSubmission(presentationSubmission: PresentationSubmission): Validated {
    return PEX.validateSubmission(presentationSubmission);
  }

  /**
   * This method can be used to combine a v1 definition, selected Verifiable Credentials, together with
   * signing opts and a callback to sign a presentation, making it a Verifiable Presentation before sending. With an async callback
   *
   * Please note that PEX has no signature support on purpose. We didn't want this library to depend on all kinds of signature suites.
   * The callback function next to the Signing Params also gets a Presentation which is evaluated against the definition.
   * It is up to you to decide whether you simply update the supplied partial proof and add it to the presentation in the callback,
   * or whether you will use the selected Credentials, Presentation definition, evaluation results and/or presentation submission together with the signature opts
   *
   * @param presentationDefinition the Presentation Definition V1
   * @param selectedCredentials the PEX and/or User selected/filtered credentials that will become part of the Verifiable Presentation
   * @param signingCallBack the function which will be provided as a parameter. And this will be the method that will be able to perform actual
   *        signing. One example of signing is available in the project named. pe-selective-disclosure.
   * @param opts: Signing Params these are the signing params required to sign.
   *
   * @return the signed and thus Verifiable Presentation.
   */
  /* public async verifiablePresentationFrom(
    presentationDefinition: PresentationDefinitionV1,
    selectedCredentials: OriginalVerifiableCredential[],
    signingCallBack: (callBackParams: PresentationSignCallBackParams) => Promise<W3CVerifiablePresentation> | W3CVerifiablePresentation,
    opts: VerifiablePresentationFromOpts
  ): Promise<W3CVerifiablePresentation> {
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
    this.evaluateCredentials(presentationDefinition, selectedCredentials, {
      holderDIDs,
      limitDisclosureSignatureSuites,
    });

    const presentation = this.presentationFrom(presentationDefinition, selectedCredentials, { holderDID: holderDID });
    const evaluationResults = this.evaluatePresentation(presentationDefinition, presentation, { limitDisclosureSignatureSuites });
    if (!evaluationResults.value) {
      throw new Error('Could not get evaluation results from presentation');
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

    const callBackParams: PresentationSignCallBackParams = {
      options: opts,
      presentation,
      presentationDefinition,
      selectedCredentials,
      proof,
      presentationSubmission: evaluationResults.value,
      evaluationResults,
    };

    return await signingCallBack(callBackParams);
  }*/
}
