import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { EvaluationClientWrapper, EvaluationResults } from './evaluation';
import { PresentationDefinitionVB, PresentationSubmissionVB, Validated, ValidationEngine } from './validation';
import { VerifiableCredential } from './verifiablePresentation';
import { VerifiablePresentation } from './verifiablePresentation';

export class PEJS {
  private _evaluationClientWrapper: EvaluationClientWrapper;

  constructor() {
    this._evaluationClientWrapper = new EvaluationClientWrapper();
  }

  public evaluate(
    presentationDefinition: PresentationDefinition,
    verifiablePresentation: VerifiablePresentation,
    did: string
  ): EvaluationResults {
    return new EvaluationClientWrapper().evaluate(presentationDefinition, verifiablePresentation, did);
  }

  public selectFrom() {
    throw new Error('Not implemented in Alpha. Planned for Beta.');
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
