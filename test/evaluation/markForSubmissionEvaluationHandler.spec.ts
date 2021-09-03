import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { Presentation, VP } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation/evaluationClient';
import { HandlerCheckResult } from '../../lib/evaluation/handlerCheckResult';
import { MarkForSubmissionEvaluationHandler } from '../../lib/evaluation/markForSubmissionEvaluationHandler';

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
    payload: { result: { value: 'eu', path: ['$', 'details', 'citizenship'] }, valid: true }
  },
  {
    input_descriptor_path: '$.input_descriptors[0]',
    verifiable_credential_path: '$.verifiableCredential[0]',
    evaluator: 'PredicateRelatedField',
    status: 'info',
    message: 'Input candidate valid for presentation submission',
    payload: { value: true, path: ['$', 'age'] }
  }
];

const results_with_error: HandlerCheckResult[] = [
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
    payload: { result: { value: 'eu', path: ['$', 'details', 'citizenship'] }, valid: true }
  },
  {
    input_descriptor_path: '$.input_descriptors[0]',
    verifiable_credential_path: '$.verifiableCredential[0]',
    evaluator: 'PredicateRelatedField',
    status: 'error',
    message: 'Input candidate invalid for presentation submission',
    payload: { value: false, path: ['$', 'age'] }
  }
];

function getFile(path: string): unknown {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('markForSubmissionEvaluationHandler tests', () => {

  it(`Mark input candidates for presentation submission`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentation: Presentation = new Presentation(inputCandidates['@context'], inputCandidates['presentation_submission'], inputCandidates['type'], inputCandidates['verifiableCredential'], inputCandidates['holder'], inputCandidates['proof']);
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]];
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.results.push(...results);
    const evaluationHandler = new MarkForSubmissionEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, new VP(presentation));
    const length = evaluationHandler.getResults().length;
    expect(evaluationHandler.getResults()[length - 1]).toEqual({
      evaluator: 'MarkForSubmissionEvaluation',
      input_descriptor_path: '$.input_descriptors[0]',
      message: 'The input candidate is eligible for submission',
      payload: { group: ['A'] },
      status: 'info',
      verifiable_credential_path: '$.verifiableCredential[0]'
    });
    expect(evaluationHandler.verifiablePresentation.getPresentationSubmission()).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [{
          format: 'ldp_vc',
          id: 'banking_input_1',
          path: '$.verifiableCredential[0]'
        }]
      }));
  });

  it(`Mark input candidates for presentation submission with errors`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentation: Presentation = new Presentation(inputCandidates['@context'], inputCandidates['presentation_submission'], inputCandidates['type'], inputCandidates['verifiableCredential'], inputCandidates['holder'], inputCandidates['proof']);
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]];
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.results.push(...results_with_error);
    const evaluationHandler = new MarkForSubmissionEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, new VP(presentation));
    const length = evaluationHandler.getResults().length;
    expect(evaluationHandler.getResults()[length - 1]).toEqual({
      evaluator: 'MarkForSubmissionEvaluation',
      input_descriptor_path: '$.input_descriptors[0]',
      message: 'The input candidate is not eligible for submission',
      payload: { 'evaluator': 'PredicateRelatedField', 'path': ['$', 'age'], 'value': false },
      status: 'error',
      verifiable_credential_path: '$.verifiableCredential[0]'
    });
    expect(evaluationHandler.verifiablePresentation.getPresentationSubmission()).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: []
      }));
  });
});