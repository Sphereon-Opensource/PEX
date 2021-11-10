import fs from 'fs';

import { Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClient, Status, VerifiablePresentation } from '../../lib';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const HOLDER_DID = ['HOLDER_DID:example:ebfeb1f712ebc6f1c276e12ec21'];

describe('evaluate', () => {
  it("should return error if uri in inputDescriptors doesn't match", function () {
    const presentationDefinition: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    presentationDefinition.input_descriptors[0].schema[0].uri = 'https://www.w3.org/TR/vc-data-model/#types1';
    evaluationClient.evaluate(presentationDefinition, vpSimple.verifiableCredential, HOLDER_DID);
    expect(evaluationClient.results[0]).toEqual({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'error',
      message:
        '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
      payload: {
        inputDescriptorsUris: ['https://www.w3.org/TR/vc-data-model/#types1'],
        presentationDefinitionUris: ['https://www.w3.org/2018/credentials/v1'],
      },
    });
  });

  it("should return ok if uri in vp matches at least one of input_descriptor's uris", function () {
    const presentationDefinition: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(presentationDefinition, vpSimple.verifiableCredential, HOLDER_DID);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it("should return error if uri in verifiableCredential doesn't match", function () {
    const presentationDefinition: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.verifiableCredential[0]['@context'][0] = 'https://www.w3.org/TR/vc-data-model/#types1';
    evaluationClient.evaluate(presentationDefinition, vpSimple.verifiableCredential, HOLDER_DID);
    expect(evaluationClient.results[0]).toEqual({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'error',
      message:
        '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
      payload: {
        inputDescriptorsUris: ['https://www.w3.org/2018/credentials/v1'],
        presentationDefinitionUris: ['https://www.w3.org/TR/vc-data-model/#types1'],
      },
    });
  });

  it("should return error if all the uris in vp don't match at least one of input_descriptor's uris", function () {
    const presentationDefinition: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.verifiableCredential[0][`@context`] = ['https://www.w3.org/TR/vc-data-model/#types1'];
    evaluationClient.evaluate(presentationDefinition, vpSimple.verifiableCredential, HOLDER_DID);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(2);
  });

  it("should return ok if all the uris in vp match at least one of input_descriptor's uris", function () {
    const presentationDefinition: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(presentationDefinition, vpSimple.verifiableCredential, HOLDER_DID);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return ok if limit_disclosure deletes the etc field', function () {
    const presentationDefinition: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(presentationDefinition, vpSimple.verifiableCredential, HOLDER_DID);
    expect(evaluationClient.verifiableCredential[0].credentialSubject['etc']).toBeUndefined();
  });

  it('should return error if limit_disclosure deletes the etc field', function () {
    const presentationDefinition: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    delete presentationDefinition!.input_descriptors![0]!.constraints!.limit_disclosure;
    evaluationClient.evaluate(presentationDefinition, vpSimple.verifiableCredential, HOLDER_DID);
    expect(evaluationClient.verifiableCredential[0].credentialSubject['etc']).toEqual('etc');
  });

  it('should return error if limit_disclosure deletes the etc field', function () {
    const presentationDefinition: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    presentationDefinition!.input_descriptors![0]!.constraints!.limit_disclosure = Optionality.Preferred;
    evaluationClient.evaluate(presentationDefinition, vpSimple.verifiableCredential, HOLDER_DID);
    expect(evaluationClient.verifiableCredential[0].credentialSubject['etc']).toEqual('etc');
  });

  it("should return ok if vc[0] doesn't have the birthPlace field", function () {
    const presentationDefinition: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-schema-multiple-constraints.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    presentationDefinition.input_descriptors[0].schema[0].uri = 'https://www.w3.org/2018/credentials/v1';
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(presentationDefinition, vpSimple.verifiableCredential, HOLDER_DID);
    expect(evaluationClient.verifiableCredential[0].credentialSubject['birthPlace']).toBeUndefined();
  });

  it("should return ok if vc[0] doesn't have the etc field", function () {
    const presentationDefinition: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    presentationDefinition.input_descriptors;
    evaluationClient.evaluate(presentationDefinition, vpSimple.verifiableCredential, HOLDER_DID);
    expect(evaluationClient.verifiableCredential[0].credentialSubject['etc']).toBeUndefined();
  });
});
