import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { EvaluationClientWrapper, EvaluationResults, SelectResults } from './evaluation';
import { PresentationDefinitionVB, PresentationSubmissionVB, Validated, ValidationEngine } from './validation';
import { Presentation, VerifiableCredential } from './verifiablePresentation';

/**
 * This is the main interfacing class to be used from out side the library to use the functionality provided by the library.
 */
export class PEJS {
  private _evaluationClientWrapper: EvaluationClientWrapper;

  constructor() {
    this._evaluationClientWrapper = new EvaluationClientWrapper();
  }

  /**
   * The evaluate compares what is expected from a presentation with the presentation.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param presentation the presentation which has to be evaluated in comparison of the definition.
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies what requirement described in the input descriptor
   * was not fulfilled by the presentation.
   */
  public evaluate(presentationDefinition: PresentationDefinition, presentation: Presentation): EvaluationResults {
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.evaluate(presentationDefinition, presentation.verifiableCredential, [
      presentation.holder,
    ]);
  }

  /**
   * The getSelectableCredentials method is a helper function that helps filter out the verifiable credentials which can not be selected and returns
   * the selectable credentials.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param verifiableCredentials verifiable credentials are the credentials from wallet provided to the library to find selectable credentials.
   * @param holderDid the decentralized identity of the wallet holder. This is used to identify the credentials issued to the holder of wallet.
   *
   * @return the selectable credentials.
   */
  public selectFrom(
    presentationDefinition: PresentationDefinition,
    verifiableCredentials: VerifiableCredential[],
    holderDids: string[]
  ): SelectResults {
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.selectFrom(presentationDefinition, verifiableCredentials, holderDids);
  }

  /**
   * This method helps create a submittablePresentation. A submittablePresentation after signing becomes verifiablePresentation. And can be sent to
   * the verifier.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param selectedCredential the credentials which were declared selectable by getSelectableCredentials and then chosen by the intelligent-user
   * (e.g. human).
   *
   * @return the presentation submission.
   */
  public submissionFrom(
    presentationDefinition: PresentationDefinition,
    selectedCredential: VerifiableCredential[]
  ): PresentationSubmission {
    return this._evaluationClientWrapper.submissionFrom(presentationDefinition, selectedCredential);
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
}
