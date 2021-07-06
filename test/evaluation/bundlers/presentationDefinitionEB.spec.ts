import fs from 'fs';

import {PresentationDefinition, PresentationSubmission} from '@sphereon/pe-models';

import { PresentationDefinitionEB } from "../../../lib";
import { Checked, Status } from '../../../lib/ConstraintUtils';
import { EvaluationEngine } from "../../../lib/evaluation/evaluationEngine";
import { EvaluationBundler } from "../../../lib";


function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

function getTestablePresentationSubmissions(): PresentationSubmission[] {
  return [
    {
      "id": "a30e3b91-fb77-4d22-95fa-871689c322e2",
      "definition_id": "32f54163-7166-48f1-93d8-ff217bdb0653",
      "descriptor_map": [
        {
          "id": "banking_input_2",
          "format": "jwt_vc",
          "path": "$.verifiableCredential[0]"
        },
        {
          "id": "employment_input",
          "format": "ldp_vc",
          "path": "$.verifiableCredential[1]"
        },
        {
          "id": "citizenship_input_1",
          "format": "ldp_vc",
          "path": "$.verifiableCredential[2]"
        }
      ]
    },
    {
      "id": "a30e3b91-fb77-4d22-95fa-871689c322e2",
      "definition_id": "32f54163-7166-48f1-93d8-ff217bdb0653",
      "descriptor_map": [
        {
          "id": "banking_input_2",
          "format": "jwt",
          "path": "$._claim_sources.banking_input_2.JWT"
        },
        {
          "id": "employment_input",
          "format": "jwt_vc",
          "path": "$._claim_sources.employment_input.VC_JWT"
        },
        {
          "id": "citizenship_input_1",
          "format": "ldp_vc",
          "path": "$._claim_sources.citizenship_input_1.VC"
        }
      ]
    },
  ];
}

describe('validate', () => {

  /*test.each(files)(
    '.validateKnownExample(%s)',
    (file) => {
      const basicPD = getFile(base + file);

      const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionEB('root');

      const result = new ValidationEngine().validate([{bundler: vb, target: basicPD.presentation_definition}]);
      expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
    }
  );*/

  it('should return error for missing id   should return error for not matching (exactly) any URI for the schema of the candidate input with one of the Input Descriptor schema object uri values.', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    const eb: EvaluationBundler<PresentationDefinition> = new PresentationDefinitionEB('root');

    const result = new EvaluationEngine().evaluate([{bundler: eb, target: [getTestablePresentationSubmissions(), basicPD]}]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.')]);
  });

});
