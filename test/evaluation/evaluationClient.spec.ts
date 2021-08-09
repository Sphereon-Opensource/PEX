import fs from 'fs';

import { Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation/evaluationClient';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

  it('should return error if uri in inputDescriptors doesn\'t match', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = {};
    const evaluationClient: EvaluationClient = new EvaluationClient();
    pdSchema.input_descriptors[0].schema[0].uri = 'https://www.w3.org/TR/vc-data-model/#types1';
    try {
      evaluationClient.evaluate(pdSchema, vpSimple);
    } catch (error) {
      expect(error).toEqual({
        'message': 'unknown exception occurred: Cannot read property \'length\' of undefined',
        'status': 'error',
        'tag': 'root'
      });
    }
  });

  it('should return error if uri in inputDescriptors doesn\'t match', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    pdSchema.input_descriptors[0].schema[0].uri = 'https://www.w3.org/TR/vc-data-model/#types1';
    evaluationClient.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.results[0]).toEqual({
      'input_descriptor_path': '$.input_descriptors[0]',
      'verifiable_credential_path': '$.verifiableCredential[0]',
      'evaluator': 'UriEvaluation',
      'status': 'error',
      'message': 'presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
      'payload': {
        'inputDescriptorsUris': [
          'https://www.w3.org/TR/vc-data-model/#types1'
        ],
        'presentationDefinitionUri': 'https://www.w3.org/TR/vc-data-model/#types'
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
        'presentationDefinitionUri': 'https://www.w3.org/TR/vc-data-model/#types'
      }
    });
  });

  it('should return ok if uri in vp matches at least one of input_descriptor\'s uris', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    evaluationClient.evaluate(pdSchema, vpSimple);
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return error if uri in verifiableCredential doesn\'t match', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.verifiableCredential[0].credentialSchema[0].id = 'https://www.w3.org/TR/vc-data-model/#types1';
    evaluationClient.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.results[0]).toEqual({
      'input_descriptor_path': '$.input_descriptors[0]',
      'verifiable_credential_path': '$.verifiableCredential[0]',
      'evaluator': 'UriEvaluation',
      'status': 'error',
      'message': 'presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
      'payload': {
        'inputDescriptorsUris': [
          'https://www.w3.org/TR/vc-data-model/#types'
        ],
        'presentationDefinitionUri': 'https://www.w3.org/TR/vc-data-model/#types1'
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
          'https://www.w3.org/TR/vc-data-model/#types'
        ],
        'presentationDefinitionUri': 'https://www.w3.org/TR/vc-data-model/#types1'
      }
    });
  });

  it('should return error if all the uris in vp don\'t match at least one of input_descriptor\'s uris', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.verifiableCredential[0].credentialSchema.push({ id: 'https://www.w3.org/TR/vc-data-model/#types1' });
    evaluationClient.evaluate(pdSchema, vpSimple);
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(2);
  });

  it('should return ok if all the uris in vp match at least one of input_descriptor\'s uris', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    vpSimple.verifiableCredential[0].credentialSchema.push({ id: 'https://www.w3.org/TR/vc-data-model/#types1' });
    evaluationClient.evaluate(pdSchema, vpSimple);
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('Mark for submission should mark not eligible an entry not eligible if all the past steps for that entry are Status.Error', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/input_descriptor_filter_simple_example.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.input_descriptors[0].schema[0].uri = 'https://business-standards.org/schemas/employment-history.json';
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple);
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    const infoResults = evaluationClient.results.filter(result => result.status === Status.INFO);
    expect(errorResults.length).toEqual(7);
    expect(infoResults.length).toEqual(2);
  });

  it('Mark for submission should return one vc as eligible', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/input_descriptor_filter_simple_example.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.input_descriptors[0].schema[0].uri = 'https://eu.com/claims/DriversLicense';
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple);

    let errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    let infoResults = evaluationClient.results.filter(result => result.status === Status.INFO);
    expect(infoResults.length).toEqual(7);
    expect(errorResults.length).toEqual(5);
    errorResults = errorResults.filter(result => result.evaluator === "MarkForSubmissionEvaluation");
    infoResults = infoResults.filter(result => result.evaluator === "MarkForSubmissionEvaluation");
    expect(infoResults.length).toEqual(1);
    expect(errorResults.length).toEqual(2);
    expect(evaluationClient.verifiablePresentation.verifiableCredential.length).toEqual(1);
    expect(Object.keys(evaluationClient.verifiablePresentation.verifiableCredential[0])).toEqual(['@context', 'id', 'credentialSchema', 'credentialSubject', 'type', 'issuer']);
  });


  it('should return ok if limit_disclosure deletes the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0].etc).toEqual(undefined);
  });

  it('should return error if limit_disclosure deletes the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    delete pdSchema.input_descriptors[0].constraints.limit_disclosure;
    evaluationClient.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0].etc).toEqual('etc');
  });

  it('should return error if limit_disclosure deletes the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    pdSchema.input_descriptors[0].constraints.limit_disclosure = Optionality.Preferred;
    evaluationClient.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0].etc).toEqual('etc');
  });

  it('should return ok if vc[0] doesn\'t have the birthPlace field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0].birthPlace).toEqual(undefined);
  });

  it('should return ok if vc[0] doesn\'t have the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    pdSchema.input_descriptors;
    evaluationClient.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0].etc).toEqual(undefined);
  });

  it('should return ok if vc[0] doesn\'t have the birthPlace field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0].birthPlace).toEqual(undefined);
  });
});