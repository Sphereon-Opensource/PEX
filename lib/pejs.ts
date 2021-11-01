import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { EvaluationClientWrapper, EvaluationResults } from './evaluation';
import { PresentationDefinitionVB, PresentationSubmissionVB, Validated, ValidationEngine } from './validation';
import { Presentation, VerifiableCredential } from './verifiablePresentation';

export class PEJS {
  private _evaluationClientWrapper: EvaluationClientWrapper;

  constructor() {
    this._evaluationClientWrapper = new EvaluationClientWrapper();
  }

  public evaluate(
    presentationDefinition: PresentationDefinition,
    presentation: Presentation
  ): EvaluationResults {
    return this._evaluationClientWrapper.evaluate(presentationDefinition, presentation);
  }

  public selectFrom(
    presentationDefinition: PresentationDefinition,
    selectedCredentials: VerifiableCredential[],
    holderDid: string
  ) {
    return this._evaluationClientWrapper.selectFrom(presentationDefinition, selectedCredentials, holderDid);
  }

  public submissionFrom(
    presentationDefinition: PresentationDefinition,
    verifiableCredential: VerifiableCredential[]
  ): PresentationSubmission {
    return this._evaluationClientWrapper.submissionFrom(presentationDefinition, verifiableCredential);
  }

  public validateDefinition(presentationDefinition: PresentationDefinition): Validated {
    return new ValidationEngine().validate([
      {
        bundler: new PresentationDefinitionVB('root'),
        target: presentationDefinition,
      },
    ]);
  }

  public validateSubmission(presentationSubmission: PresentationSubmission): Validated {
    return new ValidationEngine().validate([
      {
        bundler: new PresentationSubmissionVB('root'),
        target: presentationSubmission,
      },
    ]);
  }
}
