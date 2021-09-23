import fs from 'fs';

import { Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClient, Presentation, Status, VP } from '../../lib';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const HOLDER_DID = 'HOLDER_DID:example:ebfeb1f712ebc6f1c276e12ec21';

describe('evaluate', () => {

  it('should return error if uri in inputDescriptors doesn\'t match', function () {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = new VP(new Presentation(null, null, null, null, HOLDER_DID, null));
    const evaluationClient: EvaluationClient = new EvaluationClient();
    presentationDefinition.input_descriptors[0].schema[0].uri = 'https://www.w3.org/TR/vc-data-model/#types1';
    try {
      evaluationClient.evaluate(presentationDefinition, vpSimple);
    } catch (error) {
      expect(error.message).toEqual('Cannot read property \'length\' of null');
    }
  });

  it('should return error if uri in inputDescriptors doesn\'t match', function () {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    presentationDefinition.input_descriptors[0].schema[0].uri = 'https://www.w3.org/TR/vc-data-model/#types1';
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));
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
  });

  it('should return ok if uri in vp matches at least one of input_descriptor\'s uris', function () {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return error if uri in verifiableCredential doesn\'t match', function () {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.verifiableCredential[0]['@context'] = 'https://www.w3.org/TR/vc-data-model/#types1';
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));
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
  });

  it('should return error if all the uris in vp don\'t match at least one of input_descriptor\'s uris', function () {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.verifiableCredential[0][`@context`] = 'https://www.w3.org/TR/vc-data-model/#types1';
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(2);
  });

  it('should return ok if all the uris in vp match at least one of input_descriptor\'s uris', function () {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('Mark for submission should mark not eligible an entry not eligible if all the past steps for that entry are Status.Error', () => {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/input_descriptor_filter_simple_example.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    presentationDefinition.input_descriptors[0].schema[0].uri = 'https://business-standards.org/schemas/employment-history.json';
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    const infoResults = evaluationClient.results.filter(result => result.status === Status.INFO);
    expect(errorResults.length).toEqual(7);
    expect(infoResults.length).toEqual(2);
  });

  it('Mark for submission should return one vc as eligible', () => {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/input_descriptor_filter_simple_example.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    presentationDefinition.input_descriptors[0].schema[0].uri = 'https://eu.com/claims/DriversLicense';
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));

    let errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    let infoResults = evaluationClient.results.filter(result => result.status === Status.INFO);
    expect(infoResults.length).toEqual(6);
    expect(errorResults.length).toEqual(6);
    errorResults = errorResults.filter(result => result.evaluator === 'MarkForSubmissionEvaluation');
    infoResults = infoResults.filter(result => result.evaluator === 'MarkForSubmissionEvaluation');
    expect(infoResults.length).toEqual(1);
    expect(errorResults.length).toEqual(2);
    expect(evaluationClient.verifiablePresentation.getVerifiableCredentials().length).toEqual(1);
    expect(Object.keys(evaluationClient.verifiablePresentation.getVerifiableCredentials()[0]).length).toEqual(6);
  });


  it('should return ok if limit_disclosure deletes the etc field', function() {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));
    expect(evaluationClient.verifiablePresentation.getVerifiableCredentials()[0]['etc']).toEqual(undefined);
  });

  it('should return error if limit_disclosure deletes the etc field', function() {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    delete presentationDefinition.input_descriptors[0].constraints.limit_disclosure;
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));
    expect(evaluationClient.verifiablePresentation.getVerifiableCredentials()[0]['etc']).toEqual('etc');
  });

  it('should return error if limit_disclosure deletes the etc field', function() {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    presentationDefinition.input_descriptors[0].constraints.limit_disclosure = Optionality.Preferred;
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));
    expect(evaluationClient.verifiablePresentation.getVerifiableCredentials()[0]['etc']).toEqual('etc');
  });

  it('should return ok if vc[0] doesn\'t have the birthPlace field', function() {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    presentationDefinition.input_descriptors[0].schema[0].uri = 'https://www.w3.org/2018/credentials/v1';
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));
    expect(evaluationClient.verifiablePresentation.getVerifiableCredentials()[0]['birthPlace']).toBeUndefined();
  });

  it('should return ok if vc[0] doesn\'t have the etc field', function() {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    presentationDefinition.input_descriptors;
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(presentationDefinition, new VP(vpSimple));
    expect(evaluationClient.verifiablePresentation.getVerifiableCredentials()[0]['etc']).toEqual(undefined);
  });
});