import fs from 'fs';

import { Optionality } from '@sphereon/pe-models';

import { EvaluationClient, InternalVerifiableCredential, Status, VerifiablePresentation } from '../../lib';
import PEMessages from '../../lib/types/Messages';
import { InternalPresentationDefinitionV1, InternalVerifiableCredentialJsonLD } from '../../lib/types/SSI.types';
import { SSITypesBuilder } from '../../lib/types/SSITypesBuilder';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const HOLDER_DID = ['HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES:example:ebfeb1f712ebc6f1c276e12ec21'];

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = ['BbsBlsSignatureProof2020'];

describe('evaluate', () => {
  it("should return error if uri in inputDescriptors doesn't match", () => {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    presentationDefinition.input_descriptors[0].schema[0].uri = 'https://www.w3.org/TR/vc-data-model/#types1';
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition);
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    evaluationClient.evaluate(pd, [vc], HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(evaluationClient.results[0]).toEqual({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'error',
      message: PEMessages.URI_EVALUATION_DIDNT_PASS,
      payload: {
        inputDescriptorsUris: ['https://www.w3.org/TR/vc-data-model/#types1'],
        presentationDefinitionUris: ['https://www.w3.org/2018/credentials/v1'],
      },
    });
  });

  it("should return ok if uri in vp matches at least one of input_descriptor's uris", function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition);
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    evaluationClient.evaluate(pd, [vc], HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it("should return error if uri in verifiableCredential doesn't match", function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition);
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.verifiableCredential[0]['@context'] = ['https://www.w3.org/TR/vc-data-model/#types1'];
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    evaluationClient.evaluate(pd, [vc], HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(evaluationClient.results[0]).toEqual({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'error',
      message: PEMessages.URI_EVALUATION_DIDNT_PASS,
      payload: {
        inputDescriptorsUris: ['https://www.w3.org/2018/credentials/v1'],
        presentationDefinitionUris: ['https://www.w3.org/TR/vc-data-model/#types1'],
      },
    });
  });

  it("should return error if all the uris in vp don't match at least one of input_descriptor's uris", function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition);
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.verifiableCredential[0][`@context`] = ['https://www.w3.org/TR/vc-data-model/#types1'];
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    evaluationClient.evaluate(pd, [vc], HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(2);
  });

  it("should return ok if all the uris in vp match at least one of input_descriptor's uris", function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition);
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pd, [vc], HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return info if limit_disclosure deletes the etc field', function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition);
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pd, [vc], HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(
      (evaluationClient.verifiableCredential[0] as InternalVerifiableCredentialJsonLD).credentialSubject['etc']
    ).toBeUndefined();
  });

  it('should return info if limit_disclosure does not delete the etc field', function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    delete presentationDefinition!.input_descriptors![0]!.constraints!.limit_disclosure;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition);
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    evaluationClient.evaluate(pd, [vc], HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(
      (evaluationClient.verifiableCredential[0] as InternalVerifiableCredentialJsonLD).credentialSubject['etc']
    ).toEqual('etc');
  });

  it('should return warn if limit_disclosure deletes the etc field', function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    presentationDefinition!.input_descriptors![0]!.constraints!.limit_disclosure = Optionality.Preferred;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition);
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    evaluationClient.evaluate(pd, [vc], HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(
      (evaluationClient.verifiableCredential[0] as InternalVerifiableCredentialJsonLD).credentialSubject['etc']
    ).toBeUndefined();
  });

  it("should return ok if vc[0] doesn't have the birthPlace field", function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-schema-multiple-constraints.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    presentationDefinition.input_descriptors[0].schema[0].uri = 'https://www.w3.org/2018/credentials/v1';
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    evaluationClient.evaluate(pd, [vc], HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(
      (evaluationClient.verifiableCredential[0] as InternalVerifiableCredentialJsonLD).credentialSubject['birthPlace']
    ).toBeUndefined();
  });

  it("should return ok if vc[0] doesn't have the etc field", function () {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition);
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    evaluationClient.evaluate(pd, [vc], HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(
      (evaluationClient.verifiableCredential[0] as InternalVerifiableCredentialJsonLD).credentialSubject['etc']
    ).toBeUndefined();
  });
});
