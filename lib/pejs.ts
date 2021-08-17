import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { EvaluationClientWrapper, EvaluationResults } from './evaluation';
import { PresentationDefinitionVB, Validated, ValidationEngine } from './validation';
import { VerifiableCredential } from './verifiablePresentation';
import { VerifiablePresentation } from './verifiablePresentation';

export class PEJS {
  public evaluate(
    presentationDefinition: PresentationDefinition,
    verifiablePresentation: VerifiablePresentation
  ): EvaluationResults {
    return new EvaluationClientWrapper().evaluate(presentationDefinition, verifiablePresentation);
  }

  public selectFrom() {
    throw new Error('Not implemented in Alpha. Planned for Beta.');
  }

  public submissionFrom(
    presentationDefinition: PresentationDefinition,
    verifiableCredential: VerifiableCredential[]
  ): PresentationSubmission {
    return new EvaluationClientWrapper().submissionFrom(presentationDefinition, verifiableCredential);
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
        bundler: new PresentationDefinitionVB('root'),
        target: presentationSubmission,
      },
    ]);
  }
}
