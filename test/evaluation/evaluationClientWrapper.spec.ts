import fs from 'fs';

import { Optionality, PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import {EvaluationClient, EvaluationClientWrapper, Status, VerifiablePresentation} from '../../lib';

import {EvaluationClientWrapperData} from './EvaluationClientWrapperData';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const evaluationClientWrapperData: EvaluationClientWrapperData = new EvaluationClientWrapperData();

describe('evaluate', () => {

  it('should return error if uri in inputDescriptors doesn\'t match', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema[0].uri = 'https://www.w3.org/TR/vc-data-model/#types1';
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    expect(evaluationClient.results[0]).toEqual(evaluationClientWrapperData.getInputDescriptorsDoesNotMatchResult0());
    //expect(evaluationClient.results[3]).toEqual(evaluationClientWrapperData.getInputDescriptorsDoesNotMatchResult3());
    expect(evaluationResults).toEqual(evaluationClientWrapperData.getError());
  });  
  
  it('should return ok if uri in vp matches at least one of input_descriptor\'s uris', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
    expect(evaluationResults).toEqual(evaluationClientWrapperData.getSuccess());
  });  
  
  it('should return error if uri in verifiableCredential doesn\'t match', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    vpSimple.verifiableCredential[0]['@context'] = ['https://www.w3.org/TR/vc-data-model/#types1'];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    expect(evaluationClient.results[0]).toEqual(evaluationClientWrapperData.getUriInVerifiableCredentialDoesNotMatchResult0());
    //expect(evaluationClient.results[3]).toEqual(evaluationClientWrapperData.getUriInVerifiableCredentialDoesNotMatchResult3());
    expect(evaluationResults).toEqual(evaluationClientWrapperData.getError());
  });  
  
  it('should return error if all the uris in vp don\'t match at least one of input_descriptor\'s uris', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    vpSimple.verifiableCredential[0][`@context`] = ['https://www.w3.org/TR/vc-data-model/#types1'];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(2);
    expect(evaluationResults).toEqual(evaluationClientWrapperData.getError());
  });  
  
  it('should return ok if all the uris in vp match at least one of input_descriptor\'s uris', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
    expect(evaluationResults).toEqual(evaluationClientWrapperData.getSuccess());
  });  
  
  it('should return ok if limit_disclosure deletes the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    expect(evaluationClient.verifiableCredential[0].credentialSubject['etc']).toBeUndefined();
    expect(evaluationResults).toEqual(evaluationClientWrapperData.getSuccess());
  });  
  
  it('should return error if limit_disclosure deletes the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    delete pdSchema!.input_descriptors![0]!.constraints!.limit_disclosure;
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    expect(evaluationClient.verifiableCredential[0].credentialSubject['etc']).toEqual('etc');
    expect(evaluationResults).toEqual(evaluationClientWrapperData.getSuccess());
  });  
  
  it('should return error if limit_disclosure deletes the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema!.input_descriptors![0]!.constraints!.limit_disclosure = Optionality.Preferred;
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    expect(evaluationClient.verifiableCredential[0].credentialSubject['etc']).toEqual('etc');
    expect(evaluationResults).toEqual(evaluationClientWrapperData.getSuccess());
  });  
  
  it('should return ok if vc[0] doesn\'t have the birthPlace field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    expect(evaluationClient.verifiableCredential[0].credentialSubject['birthPlace']).toBeUndefined();
    expect(evaluationResults).toEqual(evaluationClientWrapperData.getSuccess());
  });  
  
  it('should return ok if vc[0] doesn\'t have the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json') as VerifiablePresentation;
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID();
    const evaluationResults = evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    expect(evaluationClient.verifiableCredential[0].credentialSubject['etc']).toBeUndefined();
    expect(evaluationResults).toEqual(evaluationClientWrapperData.getSuccess());
  });  
  
  it('Evaluate submission requirements all rule', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json') as VerifiablePresentation;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    pdSchema!.input_descriptors = [pdSchema!.input_descriptors![0]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential);
    expect(result.descriptor_map).toEqual(expect.objectContaining(evaluationClientWrapperData.getForSubmissionRequirementsAllRuleResult0().descriptor_map));
    expect(result.definition_id).toEqual(evaluationClientWrapperData.getForSubmissionRequirementsAllRuleResult0().definition_id);
  });  
  
  it('Evaluate submission requirements pick rule', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json') as VerifiablePresentation;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![1]];
    vpSimple!.verifiableCredential![0]!.vc!.issuer = 'did:foo:123';
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID();
    evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential);
    expect(result).toEqual(expect.objectContaining({
      'definition_id': '32f54163-7166-48f1-93d8-ff217bdb0653',
      'descriptor_map': [
        {
          'format': 'ldp_vc',
          'id': 'Educational transcripts 1',
          'path': '$[1]'
        },
        {
          'format': 'ldp_vc',
          'id': 'Educational transcripts 2',
          'path': '$[2]'
        }
      ],
    }));
  });  
  
  it('Create Presentation Submission from user selected credentials (max 1 from B)', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json') as VerifiablePresentation;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![5]];
    vpSimple!.verifiableCredential![0]!.vc!.issuer = 'did:foo:123';
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID();
    evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, [{...vpSimple.verifiableCredential[1]}]);
    expect(result).toEqual(expect.objectContaining({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {'format': 'ldp_vc', 'id': 'Educational transcripts 1', 'path': '$[0]'}
      ]
    }));
  });  
  
  it('Create Presentation Submission without submission requirements', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json') as VerifiablePresentation;
    delete pdSchema!.submission_requirements;
    vpSimple!.verifiableCredential![0]!.vc!.issuer = 'did:foo:123';
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID();
    evaluationClientWrapper.evaluate(pdSchema, vpSimple.verifiableCredential, evaluationClientWrapperData.getHolderDID());
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, [{ ...vpSimple.verifiableCredential[1] }, { ...vpSimple.verifiableCredential[2] }]);
    expect(result).toEqual(expect.objectContaining({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {
          format: 'ldp_vc',
          id: 'Educational transcripts 1',
          path: '$[0]'
        },
        {
          format: 'ldp_vc',
          id: 'Educational transcripts 2',
          path: '$[1]'
        },
      ]
    }));
  });  it('should map successfully the links from selectable credentials to verifiable credentials.', () => {
    const selectResults = evaluationClientWrapperData.getSelectResults();
    new EvaluationClientWrapper().fillSelectableCredentialsToVerifiableCredentialsMapping(selectResults, evaluationClientWrapperData.getVerifiableCredential());
    const verifiableCredential = selectResults.verifiableCredentials![0];
    const indexInResults = selectResults.vcIndexes![0];
    expect(verifiableCredential.id).toEqual(evaluationClientWrapperData.getVerifiableCredential()[indexInResults].id);
  });
});
