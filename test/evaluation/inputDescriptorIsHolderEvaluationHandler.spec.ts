import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { VerifiablePresentation } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation/evaluationClient';
import { EvaluationHandler } from '../../lib/evaluation/evaluationHandler';
import { InputDescriptorIsHolderEvaluationHandler } from '../../lib/evaluation/inputDescriptorIsHolderEvaluationHandler';

function getFile(path: string): unknown {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('inputDescriptorIsHolderEvaluationHandler tests', () => {

  it(`input descriptor's constraints.is_holder is present`, () => {
    const inputCandidates = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_is_holder.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]];
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: EvaluationHandler = new InputDescriptorIsHolderEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, <VerifiablePresentation>inputCandidates);
    expect(evaluationClient.results).toEqual([
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "Input candidate valid for presentation submission",
        "payload": { "sameHolder": true },
        "status": "info",
        "verifiable_credential_path": "$.verifiableCredential[0]"
      },
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "Input candidate valid for presentation submission",
        "payload": {
          "sameHolder": {
            "actual": ["1234567890", "2457913570"],
            "expected": ["1234567890", "2457913570"],
          }
        },
        "status": "warn",
        "verifiable_credential_path": "$.verifiableCredential[0]"
      },
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "Input candidate invalid for presentation submission",
        "payload": { "sameHolder": false },
        "status": "error", "verifiable_credential_path": "$.verifiableCredential[1]"
      },
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "Input candidate invalid for presentation submission",
        "payload": {
          "sameHolder": {
            "actual": [],
            "expected": ["1234567890", "2457913570"],
          }
        },
        "status": "warn",
        "verifiable_credential_path": "$.verifiableCredential[1]"
      },
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "Input candidate invalid for presentation submission",
        "payload": { "sameHolder": false },
        "status": "error",
        "verifiable_credential_path": "$.verifiableCredential[2]"
      },
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "Input candidate invalid for presentation submission",
        "payload": {
          "sameHolder": {
            "actual": [],
            "expected": ["1234567890", "2457913570"],
          }
        },
        "status": "warn",
        "verifiable_credential_path": "$.verifiableCredential[2]"
      }
    ]);
  });
});