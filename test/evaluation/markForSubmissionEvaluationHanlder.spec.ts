import fs from 'fs';

import { PresentationDefinition, PresentationSubmission } from "@sphereon/pe-models";

import { EvaluationHandler } from "../../lib/evaluation/evaluationHandler";
import { HandlerCheckResult } from "../../lib/evaluation/handlerCheckResult";
import { MarkForSubmissionEvaluationHandler } from "../../lib/evaluation/markForSumissionEvaluationHandler";

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
  }
]

function getFile(path: string): any {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('markForSubmissionEvaluationHandler tests', () => {

  it(`Mark input candidates for presentation submission`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]];
    const evaluationHandler: EvaluationHandler = new MarkForSubmissionEvaluationHandler();
    const presentationSubmission: PresentationSubmission = { id: "", definition_id: "", descriptor_map: []};
    evaluationHandler.presentationSubmission = presentationSubmission;
    evaluationHandler.results =[...results];
    evaluationHandler.handle(presentationDefinition, inputCandidates);
    const length = evaluationHandler.results.length;
    expect(evaluationHandler.results[length - 1]).toEqual({ 
      evaluator: "MarkForSubmissionEvaluation",
      input_descriptor_path: "$.input_descriptors[0]",
      message: "The input candidate is eligible for submission",
      payload: { group: ["A"] },
      status: "info",
      verifiable_credential_path: "$.verifiableCredential[0]"
    });
    expect(evaluationHandler.presentationSubmission).toEqual(
      expect.objectContaining({
      definition_id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      descriptor_map: [{
        format: "ldp_vc",
        id: "banking_input_1",
        path: "$.verifiableCredential[0]",
      }]
    }));
  });
});