import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { VP } from '../../lib';
import { SubjectIsHolderEvaluationHandler } from '../../lib/evaluation/SubjectIsHolderEvaluationHandler';
import { Wallet } from '../../lib/evaluation/core/wallet';
import { EvaluationClient } from '../../lib/evaluation/evaluationClient';
import { EvaluationHandler } from '../../lib/evaluation/evaluationHandler';
import { Presentation } from '../../lib/verifiablePresentation/models';

function getFile(path: string): unknown {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const wallet: Wallet = { 
  data: { 
    holder: { 
      did: 'did:example:ebfeb1f712ebc6f1c276e12ec21'
    } 
  }
};

describe('SubjectIsHolderEvaluationHandler tests', () => {

  it(`input descriptor's constraints.is_holder is present`, () => {
    const presentation: Presentation = getFile('./test/dif_pe_examples/vp/vp_subject_is_holder.json') as Presentation;
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_is_holder.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]];
    
    const evaluationClient: EvaluationClient = new EvaluationClient(wallet);
    const evaluationHandler: EvaluationHandler = new SubjectIsHolderEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, new VP(presentation));
    expect(evaluationClient.results).toEqual([
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "The entity submitting the response is the holder of the claim",
        "payload": { "is_holder": true },
        "status": "info",
        "verifiable_credential_path": "$.verifiableCredential[0]"
      },
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "The entity submitting the response is the holder of the claim",
        "payload": {
          "holder": "did:example:ebfeb1f712ebc6f1c276e12ec21",
          "subject": "did:example:ebfeb1f712ebc6f1c276e12ec21",
        },
        "status": "info",
        "verifiable_credential_path": "$.verifiableCredential[0]"
      },
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "The entity submitting the response is the holder of the claim",
        "payload": { "is_holder": true },
        "status": "info", 
        "verifiable_credential_path": "$.verifiableCredential[1]"
      },
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "The entity submitting the response is the holder of the claim",
        "payload": {
          "holder": "did:example:ebfeb1f712ebc6f1c276e12ec21",
          "subject": "did:example:ebfeb1f712ebc6f1c276e12ec21",
        },
        "status": "info",
        "verifiable_credential_path": "$.verifiableCredential[1]"
      },
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "The entity submitting the response is not the holder of the claim",
        "payload": { "is_holder": false },
        "status": "error",
        "verifiable_credential_path": "$.verifiableCredential[2]"
      },
      {
        "evaluator": "IsHolderEvaluation",
        "input_descriptor_path": "$.input_descriptors[0]",
        "message": "The entity submitting the response is not the holder of the claim",
        "payload": {
          "holder": "did:example:ebfeb1f712ebc6f1c276e12ec21",
          "subject": "did:example:ebfeb1f712ebc6f1c276e12ec22",
        },
        "status": "error",
        "verifiable_credential_path": "$.verifiableCredential[2]"
      }
    ]);
  });
});