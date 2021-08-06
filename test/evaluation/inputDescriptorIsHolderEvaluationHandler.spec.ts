import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClient } from '../../lib/evaluation/evaluationClient';
import { EvaluationHandler } from '../../lib/evaluation/evaluationHandler';
import { HandlerCheckResult } from '../../lib/evaluation/handlerCheckResult';
import { InputDescriptorIsHolderEvaluationHandler } from '../../lib/evaluation/inputDescriptorIsHolderEvaluationHandler';

const results: HandlerCheckResult[] = [
  {
    input_descriptor_path: '$.input_descriptors[0]',
    verifiable_credential_path: '$.verifiableCredential[0]',
    evaluator: 'UriEvaluation',
    status: 'info',
    message: 'presentation_definition URI for the schema of the candidate input is equal to one of the input_descriptors object uri values.'
  },
  {
    input_descriptor_path: '$.input_descriptors[0]',
    verifiable_credential_path: '$.verifiableCredential[0]',
    evaluator: 'FilterEvaluation',
    status: 'info',
    message: 'Input candidate valid for presentation submission',
    payload: { result: { value: 'eu', path: ["$", "details", "citizenship"]}, valid: true }
  },
  {
    input_descriptor_path: '$.input_descriptors[0]',
    verifiable_credential_path: '$.verifiableCredential[0]',
    evaluator: 'PredicateRelatedField',
    status: 'info',
    message: 'Input candidate valid for presentation submission',
    payload: { value: true, path: ["$", "age"] }
  },
  {
    input_descriptor_path: '$.input_descriptors[1]',
    verifiable_credential_path: '$.verifiableCredential[1]',
    evaluator: 'UriEvaluation',
    status: 'info',
    message: 'presentation_definition URI for the schema of the candidate input is equal to one of the input_descriptors object uri values.'
  },
  {
    input_descriptor_path: '$.input_descriptors[1]',
    verifiable_credential_path: '$.verifiableCredential[1]',
    evaluator: 'FilterEvaluation',
    status: 'info',
    message: 'Input candidate valid for presentation submission',
    payload: { result: { value: 'eu', path: ["$", "details", "citizenship"]}, valid: true }
  },
  {
    input_descriptor_path: '$.input_descriptors[1]',
    verifiable_credential_path: '$.verifiableCredential[1]',
    evaluator: 'PredicateRelatedField',
    status: 'info',
    message: 'Input candidate valid for presentation submission',
    payload: { value: true, path: ["$", "age"] }
  }
]

function getFile(path: string): unknown {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('inputDescriptorIsHolderEvaluationHandler tests', () => {

  it(`input descriptor's constraints.is_holder is present`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_is_holder.json')['presentation_definition'];
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.results.push(...results);
    const evaluationHandler: EvaluationHandler = new InputDescriptorIsHolderEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, inputCandidates);
    expect(evaluationClient.results[6]).toEqual({
       "evaluator": "IsHolderEvaluation",
       "input_descriptor_path": "$.input_descriptors[0]",
       "message": "Input candidate invalid for presentation submission",
       "payload": {
         "results": [{ "valid": true }, {"directive": "required", "field_id": ["banking_input_1"], "valid": true},
         {"directive": "required", "field_id": ["test"], "valid": false }]},
       "status": "error", "verifiable_credential_path": "$.verifiableCredential[0]"});
    expect(evaluationClient.results[7]).toEqual({
       "evaluator": "IsHolderEvaluation",
       "input_descriptor_path": "$.input_descriptors[1]",
       "message": "Input candidate valid for presentation submission",
       "payload": {
         "results": [{"valid": true}, {"directive": "required", "field_id": ["banking_input_2"], "valid": true}]},
       "status": "info", "verifiable_credential_path": "$.verifiableCredential[1]"});
  });
});