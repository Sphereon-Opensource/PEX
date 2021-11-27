import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { EvaluationClientWrapper, EvaluationResults, SelectResults } from './evaluation';
import { SigningCallBackParams, SigningParams } from './signing';
import { PresentationDefinitionVB, PresentationSubmissionVB, Validated, ValidationEngine } from './validation';
import { Presentation, VerifiableCredential, VerifiablePresentation } from './verifiablePresentation';

/**
 * This is the main interfacing class to be used from out side the library to use the functionality provided by the library.
 */
export class PEJS {
  private _evaluationClientWrapper: EvaluationClientWrapper;

  constructor() {
    this._evaluationClientWrapper = new EvaluationClientWrapper();
  }

  /***
   * The evaluate compares what is expected from a presentation with the presentationDefinition.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param presentation the presentation which has to be evaluated in comparison of the definition.
   * @param limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the presentation.
   */
  public evaluatePresentation(
    presentationDefinition: PresentationDefinition,
    presentation: Presentation,
    limitDisclosureSignatureSuites?: string[]
  ): EvaluationResults {
    const presentationCopy: Presentation = JSON.parse(JSON.stringify(presentation));
    this._evaluationClientWrapper = new EvaluationClientWrapper();

    const holderDIDs = presentation.holder ? [presentation.holder] : [];
    return this._evaluationClientWrapper.evaluate(
      presentationDefinition,
      presentationCopy.verifiableCredential,
      holderDIDs,
      limitDisclosureSignatureSuites
    );
  }

  /***
   * The evaluate compares what is expected from a verifiableCredentials with the presentationDefinition.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param verifiableCredentials the verifiable credentials which are candidates to fulfill requirements defined in the presentationDefinition param.
   * @param holderDIDs the list of the DIDs that the wallet holders controlls.
   * @param limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the verifiable credentials.
   */
  public evaluateCredentials(
    presentationDefinition: PresentationDefinition,
    verifiableCredentials: VerifiableCredential[],
    holderDIDs: string[],
    limitDisclosureSignatureSuites: string[]
  ): EvaluationResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.evaluate(presentationDefinition, verifiableCredentialCopy, holderDIDs, limitDisclosureSignatureSuites);
  }

  /**
   * The getSelectableCredentials method is a helper function that helps filter out the verifiable credentials which can not be selected and returns
   * the selectable credentials.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param verifiableCredentials verifiable credentials are the credentials from wallet provided to the library to find selectable credentials.
   * @param holderDIDs the decentralized identity of the wallet holder. This is used to identify the credentials issued to the holder of wallet.
   * @param limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the selectable credentials.
   */
  public selectFrom(
    presentationDefinition: PresentationDefinition,
    verifiableCredentials: VerifiableCredential[],
    holderDIDs: string[],
    limitDisclosureSignatureSuites: string[]
  ): SelectResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.selectFrom(presentationDefinition, verifiableCredentialCopy, holderDIDs, limitDisclosureSignatureSuites);
  }

  /**
   * This method helps create a submittablePresentation. A submittablePresentation after signing becomes verifiablePresentation. And can be sent to
   * the verifier.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param selectedCredential the credentials which were declared selectable by getSelectableCredentials and then chosen by the intelligent-user
   * (e.g. human).
   * @param holderDID the decentralized identity of the wallet holder. This is used to identify the credentials issued to the holder of wallet.
   *
   * @return the presentation submission.
   */
  public presentationFrom(
    presentationDefinition: PresentationDefinition,
    selectedCredential: VerifiableCredential[],
    holderDID: string
  ): Presentation {
    const presentationSubmission = this._evaluationClientWrapper.submissionFrom(presentationDefinition, selectedCredential);

    return PEJS.getPresentation(holderDID, presentationSubmission, selectedCredential);
  }

  private static getPresentation(
    holderDID: string,
    presentationSubmission: PresentationSubmission,
    selectedCredential: VerifiableCredential[]
  ): Presentation {
    return {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://identity.foundation/presentation-exchange/submission/v1'],
      type: [
        'VerifiablePresentation',
        'PresentationSubmission', // This will be truely verifiable after the proof field is populated.
      ],
      holder: holderDID,
      presentation_submission: presentationSubmission,
      verifiableCredential: selectedCredential,
    };
  }

  /**
   * This method validates whether an object is usable as a presentation definition or not.
   *
   * @param presentationDefinition the object to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation definition
   */
  public validateDefinition(presentationDefinition: PresentationDefinition): Validated {
    return new ValidationEngine().validate([
      {
        bundler: new PresentationDefinitionVB('root'),
        target: presentationDefinition,
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
  public validateSubmission(presentationSubmission: PresentationSubmission): Validated {
    return new ValidationEngine().validate([
      {
        bundler: new PresentationSubmissionVB('root'),
        target: presentationSubmission,
      },
    ]);
  }

  /**
   * This method can be used to combine a definition, selected Verifiable Credentials, together with
   * signing options and a callback to sign a presentation, making it a Verifiable Presentation before sending.
   *
   * Please note that PE-JS has no signature support on purpose. We didn't want this library to depend on all kinds of signature suites.
   * The callback function next to the Signing Params also gets a Presentation which is evaluated against the definition.
   * It is up to you to decide whether you simply add the proof to the supplied presentation in the callback,
   * or whether you will use the selected Credentials, Presentation definition, evaluation results and/or presentation submission together with the signature options
   *
   * @param opts: Signing Params these are the signing params required to sign.
   * @param signingCallBack the function which will be provided as a parameter. And this will be the method that will be able to perform actual
   *        signing. One example of signing is available in the project named. pe-selective-disclosure.
   *
   * @return the signed and thus Verifiable Presentation.
   */
  public createVerifiablePresentation(
    signingCallBack: (opts: SigningCallBackParams) => VerifiablePresentation,
    opts: SigningParams
  ): VerifiablePresentation {
    //fixme: holderDids and suites
    this.evaluateCredentials(
      opts.presentationDefinition,
      opts.selectedCredentials,
      [opts.signingOptions.verificationMethodOpts.controller],
      [opts.signingOptions.type]
    );

    const presentation = this.presentationFrom(
      opts.presentationDefinition,
      opts.selectedCredentials,
      opts.signingOptions.verificationMethodOpts.controller
    );
    const evaluationResults = this.evaluatePresentation(opts.presentationDefinition, presentation, [opts.signingOptions.type]);
    if (!evaluationResults.value) {
      throw new Error('Could not get evaluation results from presentation');
    }
    return signingCallBack({
      presentation,
      presentationDefinition: opts.presentationDefinition,
      selectedCredentials: opts.selectedCredentials,
      signingOptions: opts.signingOptions,
      presentationSubmission: evaluationResults.value,
      evaluationResults,
    });
  }
}
