import fs from 'fs';

import { Optionality } from '@sphereon/pex-models';

import { HandlerCheckResult, Status } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation';
import { PredicateRelatedFieldEvaluationHandler } from '../../lib/evaluation/handlers';
import { InternalPresentationDefinitionV1 } from '../../lib/types';
import PexMessages from '../../lib/types/Messages';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {
  it('should return ok if payload value of PredicateRelatedField is integer', function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.results.push({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'info',
      message: PexMessages.URI_EVALUATION_PASSED,
      payload: {
        presentationDefinitionUris: ['https://www.w3.org/TR/vc-data-model/#types'],
        inputDescriptorsUris: ['https://www.w3.org/TR/vc-data-model/#types'],
      },
    });
    evaluationClient.results.push({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'FilterEvaluation',
      status: 'info',
      message: PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
      payload: {
        result: {
          value: 19,
          path: ['$', 'credentialSubject', 'age'],
        },
        valid: true,
      },
    });
    const evaluationHandler = new PredicateRelatedFieldEvaluationHandler(evaluationClient);
    evaluationClient.presentationSubmission = {
      id: 'ftc3QsJT-gZ_JNKpusT-I',
      definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
      descriptor_map: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          format: 'ldp_vc',
          path: '$[0]',
        },
      ],
    };
    evaluationHandler.handle(presentationDefinition);
    expect(evaluationClient.results[2]).toEqual(
      new HandlerCheckResult(
        '$.input_descriptors[0]',
        '$[0]',
        'PredicateRelatedFieldEvaluation',
        Status.INFO,
        PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
        {
          path: ['$', 'credentialSubject', 'age'],
          value: 19,
        },
      ),
    );
  });

  it('should return ok if payload value of PredicateRelatedField is boolean', function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    presentationDefinition!.input_descriptors![0]!.constraints!.fields![0]!.predicate = Optionality.Preferred;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.presentationSubmission = {
      id: 'ftc3QsJT-gZ_JNKpusT-I',
      definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
      descriptor_map: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          format: 'ldp_vc',
          path: '$[0]',
        },
      ],
    };
    evaluationClient.results.push({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'info',
      message: PexMessages.URI_EVALUATION_PASSED,
      payload: {
        presentationDefinitionUris: ['https://www.w3.org/TR/vc-data-model/#types'],
        inputDescriptorsUris: ['https://www.w3.org/TR/vc-data-model/#types'],
      },
    });
    evaluationClient.results.push({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'FilterEvaluation',
      status: 'info',
      message: PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
      payload: {
        result: {
          value: 19,
          path: ['$', 'credentialSubject', 'age'],
        },
        valid: true,
      },
    });
    const evaluationHandler = new PredicateRelatedFieldEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition);
    expect(evaluationClient.results[2]).toEqual(
      new HandlerCheckResult(
        '$.input_descriptors[0]',
        '$[0]',
        'PredicateRelatedFieldEvaluation',
        Status.INFO,
        PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
        {
          path: ['$', 'credentialSubject', 'age'],
          value: true,
        },
      ),
    );
  });

  it('should return error if we process the predicate filter for this PD', function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    presentationDefinition!.input_descriptors![0]!.constraints!.fields![0]!.predicate = Optionality.Preferred;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.presentationSubmission = {
      id: 'ftc3QsJT-gZ_JNKpusT-I',
      definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
      descriptor_map: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          format: 'ldp_vc',
          path: '$[0]',
        },
      ],
    };
    evaluationClient.results.push({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'info',
      message: PexMessages.URI_EVALUATION_PASSED,
      payload: {
        presentationDefinitionUris: ['https://www.w3.org/TR/vc-data-model/#types'],
        inputDescriptorsUris: ['https://www.w3.org/TR/vc-data-model/#types'],
      },
    });
    evaluationClient.results.push({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'FilterEvaluation',
      status: 'error',
      message: PexMessages.INPUT_CANDIDATE_DOESNT_CONTAIN_PROPERTY,
      payload: {
        result: [],
        valid: false,
      },
    });
    const evaluationHandler = new PredicateRelatedFieldEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition);
    expect(evaluationClient.results.length).toEqual(2);
  });

  it("should return ok if verifiableCredential's age value is matching the specification in the input descriptor", function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-schema-multiple-constraints.json',
    ).presentation_definition;
    presentationDefinition!.input_descriptors![0]!.constraints!.fields![0]!.predicate = Optionality.Preferred;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.presentationSubmission = {
      id: 'ftc3QsJT-gZ_JNKpusT-I',
      definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
      descriptor_map: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          format: 'ldp_vc',
          path: '$[0]',
        },
      ],
    };
    evaluationClient.results.push({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'info',
      message: PexMessages.URI_EVALUATION_PASSED,
      payload: {
        presentationDefinitionUris: ['https://www.w3.org/TR/vc-data-model/#types'],
        inputDescriptorsUris: ['https://www.w3.org/TR/vc-data-model/#types'],
      },
    });
    evaluationClient.results.push({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'FilterEvaluation',
      status: 'info',
      message: PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
      payload: {
        result: {
          value: 19,
          path: ['$', 'credentialSubject', 'age'],
        },
        valid: true,
      },
    });
    evaluationClient.results.push({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'FilterEvaluation',
      status: 'info',
      message: PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
      payload: {
        result: {
          path: ['$', 'credentialSubject', 'details', 'citizenship', 0],
          value: 'eu',
        },
        valid: true,
      },
    });
    evaluationClient.results.push({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'FilterEvaluation',
      status: 'info',
      message: PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
      payload: {
        result: {
          value: 'NLD',
          path: ['$', 'credentialSubject', 'country', 0, 'abbr'],
        },
        valid: true,
      },
    });
    const evaluationHandler = new PredicateRelatedFieldEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition);
    expect(evaluationClient.results[4]).toEqual(
      new HandlerCheckResult(
        '$.input_descriptors[0]',
        '$[0]',
        'PredicateRelatedFieldEvaluation',
        Status.INFO,
        PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
        { value: true, path: ['$', 'credentialSubject', 'age'] },
      ),
    );
    expect(evaluationClient.results[5]).toEqual(
      new HandlerCheckResult(
        '$.input_descriptors[0]',
        '$[0]',
        'PredicateRelatedFieldEvaluation',
        Status.INFO,
        PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
        { value: 'eu', path: ['$', 'credentialSubject', 'details', 'citizenship', 0] },
      ),
    );
    expect(evaluationClient.results[6]).toEqual(
      new HandlerCheckResult(
        '$.input_descriptors[0]',
        '$[0]',
        'PredicateRelatedFieldEvaluation',
        Status.INFO,
        PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
        {
          value: 'NLD',
          path: ['$', 'credentialSubject', 'country', 0, 'abbr'],
        },
      ),
    );
  });
});
