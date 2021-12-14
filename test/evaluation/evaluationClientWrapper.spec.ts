import fs from 'fs';

import { Optionality, PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { Status, VerifiableCredential, VerifiablePresentation } from '../../lib';
import { EvaluationClient, EvaluationClientWrapper } from '../../lib/evaluation';
import { VerifiableCredentialJsonLD, VerifiableCredentialJwt } from '../../lib/types/SSI.types';

import { EvaluationClientWrapperData } from './EvaluationClientWrapperData';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = ['BbsBlsSignatureProof2020'];

const evaluationClientWrapperData: EvaluationClientWrapperData = new EvaluationClientWrapperData();

describe('evaluate', () => {
  it("should return error if uri in inputDescriptors doesn't match", function () {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema[0].uri = 'https://www.w3.org/TR/vc-data-model/#types1';
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationResults = evaluationClientWrapper.evaluate(
      pdSchema,
      [vc],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    expect(evaluationClient.results[0]).toEqual(evaluationClientWrapperData.getInputDescriptorsDoesNotMatchResult0());
    expect(evaluationClient.results[5]).toEqual(evaluationClientWrapperData.getInputDescriptorsDoesNotMatchResult3());
    expect(evaluationResults.errors).toEqual(evaluationClientWrapperData.getError().errors);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it("should return ok if uri in vp matches at least one of input_descriptor's uris", function () {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationResults = evaluationClientWrapper.evaluate(
      pdSchema,
      [vc],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors?.length).toEqual(0);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it("should return error if uri in verifiableCredential doesn't match", function () {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    vpSimple.verifiableCredential[0]['@context'] = ['https://www.w3.org/TR/vc-data-model/#types1'];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationResults = evaluationClientWrapper.evaluate(
      pdSchema,
      [vc],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    expect(evaluationClient.results[0]).toEqual(
      evaluationClientWrapperData.getUriInVerifiableCredentialDoesNotMatchResult0()
    );
    expect(evaluationClient.results[5]).toEqual(
      evaluationClientWrapperData.getUriInVerifiableCredentialDoesNotMatchResult3()
    );
    expect(evaluationResults.errors).toEqual(evaluationClientWrapperData.getError().errors);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it("should return error if all the uris in vp don't match at least one of input_descriptor's uris", function () {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    vpSimple.verifiableCredential[0][`@context`] = ['https://www.w3.org/TR/vc-data-model/#types1'];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationResults = evaluationClientWrapper.evaluate(
      pdSchema,
      [vc],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(2);
    expect(evaluationResults.errors).toEqual(evaluationClientWrapperData.getError().errors);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it("should return ok if all the uris in vp match at least one of input_descriptor's uris", function () {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationResults = evaluationClientWrapper.evaluate(
      pdSchema,
      [vc],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors?.length).toEqual(0);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it('should return info if limit_disclosure deletes the etc field', function () {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationResults = evaluationClientWrapper.evaluate(
      pdSchema,
      [vc],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    expect(
      (evaluationClient.verifiableCredential[0] as VerifiableCredentialJsonLD).credentialSubject['etc']
    ).toBeUndefined();
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors).toEqual(evaluationClientWrapperData.getSuccess().errors);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it('should return info if limit_disclosure does not delete the etc field', function () {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    delete pdSchema!.input_descriptors![0]!.constraints!.limit_disclosure;
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationResults = evaluationClientWrapper.evaluate(
      pdSchema,
      [vc],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    expect((evaluationClient.verifiableCredential[0] as VerifiableCredentialJsonLD).credentialSubject['etc']).toEqual(
      'etc'
    );
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors).toEqual(evaluationClientWrapperData.getSuccess().errors);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it('should return warn if limit_disclosure deletes the etc field', function () {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema!.input_descriptors![0]!.constraints!.limit_disclosure = Optionality.Preferred;
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationResults = evaluationClientWrapper.evaluate(
      pdSchema,
      [vc],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    expect(
      (evaluationClient.verifiableCredential[0] as VerifiableCredentialJsonLD).credentialSubject['etc']
    ).toBeUndefined();
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getWarn().value);
    expect(evaluationResults.errors?.length).toEqual(0);
    expect(evaluationResults.warnings).toEqual(evaluationClientWrapperData.getWarn().warnings);
  });

  it("should return ok if vc[0] doesn't have the birthPlace field", function () {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-schema-multiple-constraints.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationResults = evaluationClientWrapper.evaluate(
      pdSchema,
      [vc],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    expect(
      (evaluationClient.verifiableCredential[0] as VerifiableCredentialJsonLD).credentialSubject['birthPlace']
    ).toBeUndefined();
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors?.length).toEqual(0);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it("should return ok if vc[0] doesn't have the etc field", function () {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile(
      './test/dif_pe_examples/vp/vp-simple-age-predicate.json'
    ) as VerifiablePresentation;
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID()[0];
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationResults = evaluationClientWrapper.evaluate(
      pdSchema,
      [vc],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    expect(
      (evaluationClient.verifiableCredential[0] as VerifiableCredentialJsonLD).credentialSubject['etc']
    ).toBeUndefined();
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors?.length).toEqual(0);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it('Evaluate submission requirements all rule', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile(
      './test/dif_pe_examples/vp/vp_general.json'
    ) as VerifiablePresentation;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    pdSchema!.input_descriptors = [pdSchema!.input_descriptors![0]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    let vc0: VerifiableCredential = new VerifiableCredentialJwt();
    vc0 = Object.assign(vc0, vpSimple.verifiableCredential[0]);
    let vc1: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc1 = Object.assign(vc1, vpSimple.verifiableCredential[1]);
    let vc2: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc2 = Object.assign(vc2, vpSimple.verifiableCredential[2]);
    evaluationClientWrapper.evaluate(
      pdSchema,
      [vc0, vc1, vc2],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(
      pdSchema,
      vpSimple.verifiableCredential
    );
    expect(result.descriptor_map).toEqual(
      expect.objectContaining(evaluationClientWrapperData.getForSubmissionRequirementsAllRuleResult0().descriptor_map)
    );
    expect(result.definition_id).toEqual(
      evaluationClientWrapperData.getForSubmissionRequirementsAllRuleResult0().definition_id
    );
  });

  it('Evaluate submission requirements pick rule', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile(
      './test/dif_pe_examples/vp/vp_general.json'
    ) as VerifiablePresentation;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![1]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID()[0];
    let vc0: VerifiableCredential = new VerifiableCredentialJwt();
    vc0 = Object.assign(vc0, vpSimple.verifiableCredential[0]);
    vc0.getBaseCredential().issuer = 'did:foo:123';
    let vc1: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc1 = Object.assign(vc1, vpSimple.verifiableCredential[1]);
    let vc2: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc2 = Object.assign(vc2, vpSimple.verifiableCredential[2]);
    evaluationClientWrapper.evaluate(
      pdSchema,
      [vc0, vc1, vc2],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, [vc0, vc1, vc2]);
    expect(result).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          {
            format: 'ldp_vc',
            id: 'Educational transcripts 1',
            path: '$.verifiableCredential[1]',
          },
          {
            format: 'ldp_vc',
            id: 'Educational transcripts 2',
            path: '$.verifiableCredential[2]',
          },
        ],
      })
    );
  });

  it('Create Presentation Submission from user selected credentials (max 1 from B)', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile(
      './test/dif_pe_examples/vp/vp_general.json'
    ) as VerifiablePresentation;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![5]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID()[0];
    let vc0: VerifiableCredential = new VerifiableCredentialJwt();
    vc0 = Object.assign(vc0, vpSimple.verifiableCredential[0]);
    vc0.getBaseCredential().issuer = 'did:foo:123';
    let vc1: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc1 = Object.assign(vc1, vpSimple.verifiableCredential[1]);
    let vc2: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc2 = Object.assign(vc2, vpSimple.verifiableCredential[2]);
    evaluationClientWrapper.evaluate(
      pdSchema,
      [vc0, vc1, vc2],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, [
      { ...vc1 } as VerifiableCredentialJsonLD,
    ]);
    expect(result).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [{ format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[0]' }],
      })
    );
  });

  it('Create Presentation Submission without submission requirements', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile(
      './test/dif_pe_examples/vp/vp_general.json'
    ) as VerifiablePresentation;
    delete pdSchema!.submission_requirements;
    let vc0: VerifiableCredential = new VerifiableCredentialJwt();
    const vcAttr: VerifiableCredentialJwt = <VerifiableCredentialJwt>vpSimple.verifiableCredential[0];
    vc0 = Object.assign(vc0, vcAttr);
    vc0.getBaseCredential().issuer = 'did:foo:123';
    let vc1: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc1 = Object.assign(vc1, vpSimple.verifiableCredential[1]);
    let vc2: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc2 = Object.assign(vc2, vpSimple.verifiableCredential[2]);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID()[0];
    evaluationClientWrapper.evaluate(
      pdSchema,
      [vc0, vc1, vc2],
      evaluationClientWrapperData.getHolderDID(),
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, [
      { ...vpSimple.verifiableCredential[1] } as VerifiableCredentialJsonLD,
      { ...vpSimple.verifiableCredential[2] } as VerifiableCredentialJsonLD,
    ]);
    expect(result).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          {
            format: 'ldp_vc',
            id: 'Educational transcripts 1',
            path: '$.verifiableCredential[0]',
          },
          {
            format: 'ldp_vc',
            id: 'Educational transcripts 2',
            path: '$.verifiableCredential[1]',
          },
        ],
      })
    );
  });
  it('should map successfully the links from selectable credentials to verifiable credentials.', () => {
    const selectResults = evaluationClientWrapperData.getSelectResults();
    new EvaluationClientWrapper().fillSelectableCredentialsToVerifiableCredentialsMapping(
      selectResults,
      evaluationClientWrapperData.getVerifiableCredential()
    );
    const verifiableCredential = selectResults.verifiableCredential![0];
    const indexInResults = selectResults.vcIndexes![0];
    expect(verifiableCredential.id).toEqual(evaluationClientWrapperData.getVerifiableCredential()[indexInResults].id);
  });
});
