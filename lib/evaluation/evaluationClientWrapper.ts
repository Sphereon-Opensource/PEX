import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClient } from './evaluationClient';
import { SubmissionRequirementMatch } from './core/submissionRequirementMatch';

export class EvaluationClientWrapper {
  private _client: EvaluationClient;

  constructor() {
    this._client = new EvaluationClient();
  }

  public selectFrom(
    presentationDefinition: PresentationDefinition,
    selectedCredentials: unknown[]
  ): { matches: SubmissionRequirementMatch[]; warnings: string[] } {
    this._client.evaluate(presentationDefinition, { verifiableCredential: selectedCredentials });
    const submissionRequirementMatches: SubmissionRequirementMatch[] = this.createSubmissionRequirementMatches(
      presentationDefinition,
      this._client.verifiablePresentation
    );
    return { matches: submissionRequirementMatches, warnings: [] };
  }

  private createSubmissionRequirementMatches(
    presentationDefinition: PresentationDefinition,
    verifiablePresentation: any
  ) {
    console.log("presentationDefinition: ", presentationDefinition);
    console.log("verifiablePresentation: ", verifiablePresentation);

    /**
     *
     {
      matches: [{
        name: "Drinking age",
        rule: Rules.All,
        count: 1,
        matches: [{
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          "age": 19,
          "credentialSchema": [
            {
              "id": "https://www.w3.org/TR/vc-data-model/#types"
            }
          ],
          "credentialSubject": null,
          "id": "2dc74354-e965-4883-be5e-bfec48bf60c7",
          "issuer": "",
          "type": "VerifiableCredential"
        }],
      }], warnings: []
    }
     */
    return null;
  }
}
