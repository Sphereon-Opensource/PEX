import fs from 'fs';

import { Optionality, PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { EvaluationClient, EvaluationClientWrapper, Status, VerifiablePresentation } from '../../lib';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';

const success = {
  'errors': [],
  'value': expect.objectContaining({
    'definition_id': '31e2f0f1-6b70-411d-b239-56aed5321884',
    'descriptor_map': [
      { 'format': 'ldp_vc', 'id': '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8', 'path': '$.verifiableCredential[0]' }
    ]
  }),
  'warnings': []
};

const error = {
  'errors': [
    {
      'message': '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.: $.input_descriptors[0]: $.verifiableCredential[0]',
      'status': 'error',
      'tag': 'UriEvaluation'
    },
    {
      'message': 'The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[0]',
      'status': 'error',
      'tag': 'MarkForSubmissionEvaluation'
    }
  ], 'warnings': []
};

const error_2 = {
  'errors': [
    {
      'message': '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.: $.input_descriptors[0]: $.verifiableCredential[0]',
      'status': 'error',
      'tag': 'UriEvaluation'
    },
    {
      'message': '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.: $.input_descriptors[0]: $.verifiableCredential[2]',
      'status': 'error',
      'tag': 'UriEvaluation'
    },
    {
      'message': 'Input candidate failed filter evaluation: $.input_descriptors[0]: $.verifiableCredential[1]',
      'status': 'error',
      'tag': 'FilterEvaluation'
    },
    {
      'message': 'Input candidate failed filter evaluation: $.input_descriptors[0]: $.verifiableCredential[2]',
      'status': 'error',
      'tag': 'FilterEvaluation'
    },
    {
      'message': 'The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[0]',
      'status': 'error',
      'tag': 'MarkForSubmissionEvaluation'
    },
    {
      'message': 'The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[2]',
      'status': 'error',
      'tag': 'MarkForSubmissionEvaluation'
    },
    {
      'message': 'The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[1]',
      'status': 'error',
      'tag': 'MarkForSubmissionEvaluation'
    }],
  'warnings': []
};

const success_error = {
  'errors': [
    {
      'message': '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.: $.input_descriptors[0]: $.verifiableCredential[1]',
      'status': 'error',
      'tag': 'UriEvaluation'
    },
    {
      'message': '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.: $.input_descriptors[0]: $.verifiableCredential[2]',
      'status': 'error',
      'tag': 'UriEvaluation'
    },
    {
      'message': 'Input candidate failed filter evaluation: $.input_descriptors[0]: $.verifiableCredential[1]',
      'status': 'error',
      'tag': 'FilterEvaluation'
    },
    {
      'message': 'Input candidate failed filter evaluation: $.input_descriptors[0]: $.verifiableCredential[2]',
      'status': 'error',
      'tag': 'FilterEvaluation'
    },
    {
      'message': 'The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[1]',
      'status': 'error',
      'tag': 'MarkForSubmissionEvaluation'
    },
    {
      'message': 'The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[2]',
      'status': 'error',
      'tag': 'MarkForSubmissionEvaluation'
    }
  ],
  'value': expect.objectContaining({
    'definition_id': '32f54163-7166-48f1-93d8-ff217bdb0653',
    'descriptor_map': [
      {
        'format': 'ldp_vc',
        'id': 'bankaccount_input',
        'path': '$.verifiableCredential[0]'
      }
    ]
  }),
  'warnings': []
};

describe('evaluate', () => {

  // Step 1: Matching Uri Schema
  it('should return error if uri in inputDescriptors doesn\'t match', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema[0].uri = 'https://www.w3.org/TR/vc-data-model/#types1';
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.results[0]).toEqual({
      'input_descriptor_path': '$.input_descriptors[0]',
      'verifiable_credential_path': '$.verifiableCredential[0]',
      'evaluator': 'UriEvaluation',
      'status': 'error',
      'message': '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
      'payload': {
        'inputDescriptorsUris': [
          'https://www.w3.org/TR/vc-data-model/#types1'
        ],
        'presentationDefinitionUris': [
          'https://www.w3.org/2018/credentials/v1'
        ]
      }
    });
    expect(evaluationClient.results[3]).toEqual({
      'input_descriptor_path': '$.input_descriptors[0]',
      'verifiable_credential_path': '$.verifiableCredential[0]',
      'evaluator': 'MarkForSubmissionEvaluation',
      'status': 'error',
      'message': 'The input candidate is not eligible for submission',
      'payload': {
        'evaluator': 'UriEvaluation',
        'inputDescriptorsUris': [
          'https://www.w3.org/TR/vc-data-model/#types1'
        ],
        'presentationDefinitionUris': [
          'https://www.w3.org/2018/credentials/v1'
        ]
      }
    });
    expect(evaluationResults).toEqual(error);
  });

  it('should return ok if uri in vp matches at least one of input_descriptor\'s uris', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
    expect(evaluationResults).toEqual(success);
  });

  it('should return error if uri in verifiableCredential doesn\'t match', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    vpSimple.verifiableCredential[0]['@context'] = ['https://www.w3.org/TR/vc-data-model/#types1'];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.results[0]).toEqual({
      'input_descriptor_path': '$.input_descriptors[0]',
      'verifiable_credential_path': '$.verifiableCredential[0]',
      'evaluator': 'UriEvaluation',
      'status': 'error',
      'message': '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
      'payload': {
        'inputDescriptorsUris': [
          'https://www.w3.org/2018/credentials/v1'
        ],
        'presentationDefinitionUris': [
          'https://www.w3.org/TR/vc-data-model/#types1'
        ]
      }
    });
    expect(evaluationClient.results[3]).toEqual({
      'input_descriptor_path': '$.input_descriptors[0]',
      'verifiable_credential_path': '$.verifiableCredential[0]',
      'evaluator': 'MarkForSubmissionEvaluation',
      'status': 'error',
      'message': 'The input candidate is not eligible for submission',
      'payload': {
        'evaluator': 'UriEvaluation',
        'inputDescriptorsUris': [
          'https://www.w3.org/2018/credentials/v1'
        ],
        'presentationDefinitionUris': [
          'https://www.w3.org/TR/vc-data-model/#types1'
        ]
      }
    });
    expect(evaluationResults).toEqual(error);
  });

  it('should return error if all the uris in vp don\'t match at least one of input_descriptor\'s uris', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    vpSimple.verifiableCredential[0][`@context`] = ['https://www.w3.org/TR/vc-data-model/#types1'];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(2);
    expect(evaluationResults).toEqual(error);
  });

  it('should return ok if all the uris in vp match at least one of input_descriptor\'s uris', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
    expect(evaluationResults).toEqual(success);
  });

  // Mark for submission should
  it('Mark for submission should not fill out the presentation_submission object', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/input_descriptor_filter_simple_example.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.input_descriptors[0].schema[0].uri = 'https://business-standards.org/schemas/employment-history.json';
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    const infoResults = evaluationClient.results.filter(result => result.status === Status.INFO);
    expect(errorResults.length).toEqual(7);
    expect(infoResults.length).toEqual(2);
    expect(evaluationResults).toEqual(error_2);
  });

  it('Mark for submission should mark all 3 VCs as error.', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/input_descriptor_filter_simple_example.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.input_descriptors[0].schema[0].uri = 'https://eu.com/claims/DriversLicense';
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    const infoResults = evaluationClient.results.filter(result => result.status === Status.INFO);
    expect(errorResults.length).toEqual(6);
    expect(infoResults.length).toEqual(6);
    expect(evaluationResults).toEqual(success_error);
  });
  // Step 4: limit_disclosure related tests
  it('should return ok if limit_disclosure deletes the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0]['etc']).toEqual(undefined);
    expect(evaluationResults).toEqual(success);
  });

  it('should return error if limit_disclosure deletes the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    delete pdSchema!.input_descriptors![0]!.constraints!.limit_disclosure;
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0]['etc']).toEqual('etc');
    expect(evaluationResults).toEqual(success);
  });

  it('should return error if limit_disclosure deletes the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema!.input_descriptors![0]!.constraints!.limit_disclosure = Optionality.Preferred;
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0]['etc']).toEqual('etc');
    expect(evaluationResults).toEqual(success);
  });

  it('should return ok if vc[0] doesn\'t have the birthPlace field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0]['birthPlace']).toEqual(undefined);
    expect(evaluationResults).toEqual(success);
  });

  it('should return ok if vc[0] doesn\'t have the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json') as VerifiablePresentation;
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple!.holder = HOLDER_DID;
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    expect(evaluationClient!.verifiablePresentation!.verifiableCredential![0]!['etc']).toEqual(undefined);
    expect(evaluationResults).toEqual(success);
  });

  it('Evaluate submission requirements all rule', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json') as VerifiablePresentation;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    pdSchema!.input_descriptors = [pdSchema!.input_descriptors![0]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential);
    expect(result).toEqual(expect.objectContaining({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {
          id: 'Educational transcripts',
          format: 'ldp_vc',
          path: '$.verifiableCredential[0]'
        }
      ]
    }));
  });

  it('Evaluate submission requirements pick rule', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json') as VerifiablePresentation;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![1]];
    vpSimple!.verifiableCredential![0]!.vc!.issuer = "did:foo:123";
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple!.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, vpSimple);
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential);
    expect(result).toEqual(expect.objectContaining({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 1', 'path': '$.verifiableCredential[1]' },
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 2', 'path': '$.verifiableCredential[2]' },
      ]
    }));
  });
});
