import fs from 'fs';

import { Optionality, PresentationDefinitionV2, PresentationSubmission, Rules } from '@sphereon/pex-models';
import {
  AdditionalClaims,
  ICredential,
  ICredentialSubject,
  IVerifiableCredential,
  IVerifiablePresentation,
  WrappedVerifiableCredential,
  WrappedW3CVerifiableCredential,
} from '@sphereon/ssi-types';

import { Status } from '../../lib';
import { EvaluationClient, EvaluationClientWrapper } from '../../lib/evaluation';
import { InternalPresentationDefinitionV1, InternalPresentationDefinitionV2 } from '../../lib/types';
import { SSITypesBuilder } from '../../lib/types';

import { EvaluationClientWrapperData } from './EvaluationClientWrapperData';
import { hasher } from '../SdJwt.spec';

function getFile(path: string) {
  return fs.readFileSync(path, 'utf-8');
}

function getFileAsJson(path: string) {
  return JSON.parse(getFile(path));
}

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = ['BbsBlsSignatureProof2020'];

const evaluationClientWrapperData: EvaluationClientWrapperData = new EvaluationClientWrapperData();

describe('evaluate', () => {
  it("should return error if uri in inputDescriptors doesn't match", function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema[0].uri = 'https://www.w3.org/TR/vc-data-model/#types1';
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]),
      { holderDIDs: evaluationClientWrapperData.getHolderDID(), limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES },
    );
    expect(evaluationClient.results[0]).toEqual(evaluationClientWrapperData.getInputDescriptorsDoesNotMatchResult0());
    expect(evaluationClient.results[6]).toEqual(evaluationClientWrapperData.getInputDescriptorsDoesNotMatchResult3());
    expect(evaluationResults.errors).toEqual(evaluationClientWrapperData.getError().errors);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it("should return ok if uri in vp matches at least one of input_descriptor's uris", function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const vc: IVerifiableCredential = vpSimple.verifiableCredential![0] as IVerifiableCredential;
    const evaluationResults = evaluationClientWrapper.evaluate(pd, SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vc]), {
      holderDIDs: evaluationClientWrapperData.getHolderDID(),
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors?.length).toEqual(0);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it("should return error if uri in verifiableCredential doesn't match", function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    (<IVerifiableCredential>vpSimple.verifiableCredential![0])['@context' as keyof IVerifiableCredential] = [
      'https://www.w3.org/TR/vc-data-model/#types1',
    ];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]),
      { holderDIDs: evaluationClientWrapperData.getHolderDID(), limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES },
    );
    expect(evaluationClient.results[0]).toEqual(evaluationClientWrapperData.getUriInVerifiableCredentialDoesNotMatchResult0());
    expect(evaluationClient.results[6]).toEqual(evaluationClientWrapperData.getUriInVerifiableCredentialDoesNotMatchResult3());
    expect(evaluationResults.errors).toEqual(evaluationClientWrapperData.getError().errors);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it("should return error if all the uris in vp don't match at least one of input_descriptor's uris", function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    (<IVerifiableCredential>vpSimple.verifiableCredential![0])['@context' as keyof IVerifiableCredential] = [
      'https://www.w3.org/TR/vc-data-model/#types1',
    ];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]),
      { holderDIDs: evaluationClientWrapperData.getHolderDID(), limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES },
    );
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(2);
    expect(evaluationResults.errors).toEqual(evaluationClientWrapperData.getError().errors);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it("should return ok if all the uris in vp match at least one of input_descriptor's uris", function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]),
      { holderDIDs: evaluationClientWrapperData.getHolderDID(), limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES },
    );
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors?.length).toEqual(0);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it('should return info if limit_disclosure deletes the etc field', function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]),
      { holderDIDs: evaluationClientWrapperData.getHolderDID(), limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES },
    );
    const firstWrappedVc = evaluationClient.wrappedVcs[0] as WrappedW3CVerifiableCredential;
    expect((firstWrappedVc.credential.credentialSubject as ICredentialSubject & AdditionalClaims)['etc']).toBeUndefined();
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors).toEqual(evaluationClientWrapperData.getSuccess().errors);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it('should return info if limit_disclosure does not delete the etc field', function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    delete pdSchema!.input_descriptors![0]!.constraints!.limit_disclosure;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]),
      { holderDIDs: evaluationClientWrapperData.getHolderDID(), limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES },
    );
    const firstWrappedVc = evaluationClient.wrappedVcs[0] as WrappedW3CVerifiableCredential;
    expect((firstWrappedVc.credential.credentialSubject as ICredentialSubject & AdditionalClaims)['etc']).toEqual('etc');
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors).toEqual(evaluationClientWrapperData.getSuccess().errors);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it('should return warn if limit_disclosure deletes the etc field', function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema!.input_descriptors![0]!.constraints!.limit_disclosure = Optionality.Preferred;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]),
      { holderDIDs: evaluationClientWrapperData.getHolderDID(), limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES },
    );
    const firstWrappedVc = evaluationClient.wrappedVcs[0] as WrappedW3CVerifiableCredential;
    expect((firstWrappedVc.credential.credentialSubject as ICredentialSubject & AdditionalClaims)['etc']).toBeUndefined();
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getWarn().value);
    expect(evaluationResults.errors?.length).toEqual(0);
    expect(evaluationResults.warnings).toEqual(evaluationClientWrapperData.getWarn().warnings);
  });

  it("should return ok if vc[0] doesn't have the birthPlace field", function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-schema-multiple-constraints.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    const evaluationResults = evaluationClientWrapper.evaluate(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]),
      { holderDIDs: evaluationClientWrapperData.getHolderDID(), limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES },
    );
    const firstWrappedVc = evaluationClient.wrappedVcs[0] as WrappedW3CVerifiableCredential;
    expect((firstWrappedVc.credential.credentialSubject as ICredentialSubject & AdditionalClaims)['birthPlace']).toBeUndefined();
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors?.length).toEqual(0);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it("should return ok if vc[0] doesn't have the etc field", function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json') as IVerifiablePresentation;
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationClient: EvaluationClient = evaluationClientWrapper.getEvaluationClient();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID()[0];
    const evaluationResults = evaluationClientWrapper.evaluate(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]),
      { holderDIDs: evaluationClientWrapperData.getHolderDID(), limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES },
    );
    const firstWrappedVc = evaluationClient.wrappedVcs[0] as WrappedW3CVerifiableCredential;
    expect((firstWrappedVc.credential.credentialSubject as ICredentialSubject & AdditionalClaims)['etc']).toBeUndefined();
    expect(evaluationResults.value).toEqual(evaluationClientWrapperData.getSuccess().value);
    expect(evaluationResults.errors?.length).toEqual(0);
    expect(evaluationResults.warnings?.length).toEqual(0);
  });

  it('Evaluate submission requirements all rule', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    pdSchema!.input_descriptors = [pdSchema!.input_descriptors![0]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: evaluationClientWrapperData.getHolderDID(),
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pd, wvcs);
    expect(result.descriptor_map).toEqual(
      expect.objectContaining(evaluationClientWrapperData.getForSubmissionRequirementsAllRuleResult0().descriptor_map),
    );
    expect(result.definition_id).toEqual(evaluationClientWrapperData.getForSubmissionRequirementsAllRuleResult0().definition_id);
  });

  it('Evaluate submission requirements pick rule', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![1]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID()[0];
    (vpSimple.verifiableCredential![0] as ICredential).issuer = 'did:foo:123';
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: evaluationClientWrapperData.getHolderDID(),
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pd, wvcs);
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
      }),
    );
  });

  it('Create Presentation Submission from user selected credentials (max 1 from B)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![5]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID()[0];
    (vpSimple.verifiableCredential![0] as ICredential).issuer = 'did:foo:123';
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: evaluationClientWrapperData.getHolderDID(),
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pd, [wvcs[1]]);
    expect(result).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [{ format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[0]' }],
      }),
    );
  });

  it('Create Presentation Submission without submission requirements', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFileAsJson('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    delete pdSchema!.submission_requirements;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    (vpSimple.verifiableCredential![0] as ICredential).issuer = 'did:foo:123';
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple!.holder = evaluationClientWrapperData.getHolderDID()[0];
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: evaluationClientWrapperData.getHolderDID(),
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pd, [wvcs[1], wvcs[2]]);
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
      }),
    );
  });

  it('should map successfully the links from selectable credentials to verifiable credentials.', () => {
    const selectResults = evaluationClientWrapperData.getSelectResults();
    new EvaluationClientWrapper().fillSelectableCredentialsToVerifiableCredentialsMapping(
      selectResults,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(evaluationClientWrapperData.getVerifiableCredential()),
    );
    const verifiableCredential = selectResults.verifiableCredential![0] as IVerifiableCredential;
    expect(verifiableCredential.id).toEqual((<ICredential>evaluationClientWrapperData.getVerifiableCredential()[1]).id);
  });

  it('should pass with correct submissionFrom result name and roles with 2 groups', function () {
    const clientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const pdSchema: PresentationDefinitionV2 = {
      id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
      submission_requirements: [
        {
          name: 'Identity requirement',
          rule: 'all',
          from: 'A',
        },
        {
          name: 'Role requirement',
          rule: 'all',
          from: 'B',
        },
      ],
      input_descriptors: [
        {
          id: 'identity_input',
          name: 'Subject identity input',
          group: ['A'],
          purpose: 'Subject should be identifiable',
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.did'],
                filter: {
                  type: 'string',
                  const: 'did:example:d23dd687a7dc6787646f2eb98d0',
                },
              },
            ],
          },
        },
        {
          id: 'name_input',
          name: 'Subject name input',
          group: ['A'],
          purpose: 'Subject should have name',
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.profile.name'],
                filter: {
                  type: 'string',
                  const: 'John',
                },
              },
            ],
          },
        },
        {
          id: 'role_input',
          name: 'Admin role input',
          group: ['B'],
          purpose: 'Subject should have admin role',
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.role'],
                filter: {
                  type: 'string',
                  const: 'admin',
                },
              },
            ],
          },
        },
      ],
    };
    const internalPD = SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(pdSchema);
    const vcs = [
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          {
            profile: { '@id': 'ctx_id:profile', '@type': 'ctx_id:profile' },
            name: 'ctx_id:name',
            Identity: 'ctx_id:Identity',
            did: 'ctx_id:did',
            ctx_id: 'https://example.org/ld-context-2022#',
          },
        ],
        id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
        type: ['VerifiableCredential', 'Identity'],
        credentialSubject: {
          did: 'did:example:d23dd687a7dc6787646f2eb98d0',
          profile: { name: 'John' },
        },
        issuer: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
        issuanceDate: '2022-03-18T08:57:32.477Z',
        proof: {
          type: 'Ed25519Signature2018',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
          created: '2021-11-16T14:52:19.514Z',
          jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..6QqnZoVBfNzNLa6GO8vnLq7YjIxKvL-e1a4NGYFOwjf9GQtJcD6kenu8Sb_DOXERUUYZnVbsaRRrRAIN0YR0DQ',
        },
      },
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          {
            Role: 'ctx_role:Role',
            ctx_role: 'https://example.org/ld-context-2022#',
            role: 'ctx_role:role',
          },
        ],
        id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636t',
        type: ['VerifiableCredential', 'Role'],
        credentialSubject: { role: 'admin' },
        issuer: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
        issuanceDate: '2022-03-18T08:57:32.477Z',
        proof: {
          type: 'Ed25519Signature2018',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
          created: '2021-11-16T14:52:19.514Z',
          jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..nV_x5AKqH9M0u5wsEt1D_DXxYpOzuO_nqDEj-alIzPA5yi8_yWAhKbWPa2r9GoTLPehvZrpgleUDiDj-9_F6Bg',
        },
      },
    ];
    const wvcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vcs);
    const resultSelectFrom = clientWrapper.selectFrom(internalPD, wvcs, {
      holderDIDs: undefined,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(resultSelectFrom.areRequiredCredentialsPresent).toEqual(Status.WARN);
    const ps: PresentationSubmission = clientWrapper.submissionFrom(internalPD, wvcs);
    expect(ps.descriptor_map.map((d) => d.path)).toEqual(['$.verifiableCredential[0]', '$.verifiableCredential[0]', '$.verifiableCredential[1]']);
  });

  it('should pass with correct submissionFrom result', function () {
    const clientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const vcjwt = getFile('test/dif_pe_examples/vc/nameCredential-vc.jwt');
    const pdSchema: PresentationDefinitionV2 = {
      id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
      submission_requirements: [
        {
          name: 'Issuance data',
          rule: 'all',
          from: 'A',
        },
        {
          name: 'Name',
          rule: 'all',
          from: 'B',
        },
      ],
      input_descriptors: [
        {
          group: ['A'],
          id: 'issuer',
          name: 'issuer of credential',
          purpose: 'We can only allow credentials from these issuer',
          constraints: {
            fields: [
              {
                path: ['$.vc.issuer.id', '$.issuer.id', '$.vc.issuer'],
                filter: {
                  type: 'string',
                  enum: ['https://example.com/issuers/14'],
                },
              },
            ],
          },
        },
        {
          group: ['A'],
          id: 'issuance_date',
          name: 'issuance date',
          purpose: 'we can only allow credentials issued after a certain date',
          constraints: {
            fields: [
              {
                path: ['$.vc.issuanceDate', '$.issuanceDate'],
                filter: {
                  format: 'date',
                  type: 'string',
                  formatMinimum: '2018-01-1',
                },
              },
            ],
          },
        },
        {
          group: ['B'],
          id: 'name_check',
          name: 'credentialSubject name',
          purpose: 'we can only allow credentials with a certain name',
          constraints: {
            fields: [
              {
                path: ['$.vc.credentialSubject.name', '$.credentialSubject.name'],
                filter: {
                  type: 'string',
                  enum: ['Jane Doe'],
                },
              },
            ],
          },
        },
        {
          group: ['B'],
          id: 'credential_id_check',
          name: 'id of credential',
          purpose: 'we can only allow credentials with a certain id',
          constraints: {
            fields: [
              {
                path: ['$.vc.credentialSubject.id', '$.credentialSubject.id'],
                filter: {
                  type: 'string',
                  enum: ['did:example:abcdef1234567'],
                },
              },
            ],
          },
        },
      ],
    };
    const internalPD = SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(pdSchema);
    const wvcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vcjwt]);
    const resultSelectFrom = clientWrapper.selectFrom(internalPD, wvcs, {
      holderDIDs: undefined,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(resultSelectFrom.areRequiredCredentialsPresent).toEqual(Status.WARN);
    expect(resultSelectFrom.verifiableCredential?.length).toEqual(1);
    const ps: PresentationSubmission = clientWrapper.submissionFrom(
      internalPD,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(resultSelectFrom.verifiableCredential as IVerifiableCredential[]),
    );
    expect(ps.descriptor_map.map((d) => d.path)).toEqual([
      '$.verifiableCredential[0]',
      '$.verifiableCredential[0]',
      '$.verifiableCredential[0]',
      '$.verifiableCredential[0]',
    ]);
  });

  it('should pass with correct submissionFrom result with rule all', function () {
    const clientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const vcjwt = getFile('test/dif_pe_examples/vc/nameCredential-vc.jwt');
    const pdSchema: PresentationDefinitionV2 = {
      id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
      submission_requirements: [
        {
          name: 'Data check req',
          rule: Rules.All,
          from_nested: [
            {
              name: 'Issuance data',
              rule: Rules.Pick,
              min: 1,
              from: 'A',
            },
            {
              name: 'Name',
              rule: 'all',
              from: 'B',
            },
          ],
        },
      ],
      input_descriptors: [
        {
          group: ['A'],
          id: 'issuer',
          name: 'issuer of credential',
          purpose: 'We can only allow credentials from these issuer',
          constraints: {
            fields: [
              {
                path: ['$.vc.issuer.id', '$.issuer.id', '$.issuer'],
                filter: {
                  type: 'string',
                  enum: ['https://example.com/issuers/15'],
                },
              },
            ],
          },
        },
        {
          group: ['A'],
          id: 'issuance_date',
          name: 'issuance date',
          purpose: 'we can only allow credentials issued after a certain date',
          constraints: {
            fields: [
              {
                path: ['$.vc.issuanceDate', '$.issuanceDate'],
                filter: {
                  format: 'date',
                  type: 'string',
                  formatMinimum: '2018-01-1',
                },
              },
            ],
          },
        },
        {
          group: ['B'],
          id: 'name_check',
          name: 'credentialSubject name',
          purpose: 'we can only allow credentials with a certain name',
          constraints: {
            fields: [
              {
                path: ['$.vc.credentialSubject.name', '$.credentialSubject.name'],
                filter: {
                  type: 'string',
                  enum: ['Jane Doe'],
                },
              },
            ],
          },
        },
        {
          group: ['B'],
          id: 'credential_id_check',
          name: 'id of credential',
          purpose: 'we can only allow credentials with a certain id',
          constraints: {
            fields: [
              {
                path: ['$.vc.credentialSubject.id', '$.credentialSubject.id'],
                filter: {
                  type: 'string',
                  enum: ['did:example:abcdef1234567'],
                },
              },
            ],
          },
        },
      ],
    };
    const internalPD = SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(pdSchema);
    const wvcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vcjwt]);
    const resultSelectFrom = clientWrapper.selectFrom(internalPD, wvcs, {
      holderDIDs: undefined,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(resultSelectFrom.areRequiredCredentialsPresent).toEqual(Status.INFO);
    expect(resultSelectFrom.verifiableCredential?.length).toEqual(1);
    const ps: PresentationSubmission = clientWrapper.submissionFrom(
      internalPD,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(resultSelectFrom.verifiableCredential as IVerifiableCredential[]),
    );
    expect(ps.descriptor_map.map((d) => d.path)).toEqual(['$.verifiableCredential[0]', '$.verifiableCredential[0]', '$.verifiableCredential[0]']);
  });

  it("only applies selective disclosure to a wrapped vc based on the constraints from matching input descriptors", function () {
    const pdSchema: InternalPresentationDefinitionV2 = getFileAsJson(
      './test/dif_pe_examples/pdV2/pd-multi-sd-jwt-selective-disclosure.json',
    ).presentation_definition;
    const vcs: string[] = getFileAsJson('test/dif_pe_examples/vc/vc-2-sd-jwt.json').vcs;
    const pd = SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const evaluationResults = evaluationClientWrapper.evaluate(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vcs, hasher),
    );
    expect(evaluationResults).toMatchObject({
      verifiableCredential: [
        // It should keep two disclsures, but remove one. based on PD requirements.
        // First disclosure comes from first input descriptor. Second form the second input descriptor
        // the limit discloure logic recognizes that one credential can be used for both input decriptors, and 
        // applies both input descriptors disclosure fields.
        // If you only disclose it for one input descriptor, it does mean you reveal maybe some attributes that
        // are not required, but this is the best way i think for now, without overly complicating the API (otherwise
        // we need to have a separate disclosure credential per vc<->pd match).
        "eyJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFZERTQSIsImtpZCI6IiN6Nk1rZmhyQ2QxZmJoSmRlTEh2aTFYblpWUTlaNnBVSmFXbXdmVVNtQUxvMnc0OHcifQ.eyJ0ZXN0RmllbGQiOiJ0ZXN0VmFsdWUiLCJ2Y3QiOiJ0ZXN0LXZjdCIsImNuZiI6eyJraWQiOiJkaWQ6a2V5Ono2TWtlcHY0VXNQalBCNHFxS2Jpc3ZEUTlYdFkzVEIzQ1JiTm9QOXc3bTlSR0o2ZCN6Nk1rZXB2NFVzUGpQQjRxcUtiaXN2RFE5WHRZM1RCM0NSYk5vUDl3N205UkdKNmQifSwiaXNzIjoiZGlkOndlYjoxMjcuMC4wLjE6OTAwMDpwYXJhZHltLXB1YmxpYy1tZXRhZGF0YToyNzMxZWRjMC0yN2JiLTQ1MmYtYWIxZS1kM2I3M2I3YWFkYWMiLCJpYXQiOjE3MjY2NDk1OTEsIl9zZCI6WyI4bmhDRXVHVVNfSlpZY1hPMGY1Yzg4Q0lQdFluWm5vWVlYWVRkQjZGd05JIiwiRURqM1JoU3B0TlNIbEp5ZHJWRDZJeEt0ZG9iMHdUVzRiMnd6UjBjVUlkWSIsImpHSDJFYXl1cmw0bTFTOXNUSFdpWkVRYXpLT01jU1hlN2RtRlBqSnlibFUiXSwiX3NkX2FsZyI6InNoYS0yNTYifQ.F51KfZ6knRgxltGTNyISwyb2vXjV3x90Fp_UV4cJNfg9sDVrASs07f_hv1kbBjQhEEyJIw5rFwyXa958AjnTDA~WyI5MDIzNDA0MDI3NzI4OTU2OTg2NzQ5MDMiLCJjb21wbGlhbnQiLGZhbHNlXQ~WyI1MzYzNjM5MzQ2MDc1MzcyODgzNzU0OSIsIm5vbkNvbXBsaWFudCIsdHJ1ZV0~",
        "eyJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFZERTQSIsImtpZCI6IiN6Nk1rZmhyQ2QxZmJoSmRlTEh2aTFYblpWUTlaNnBVSmFXbXdmVVNtQUxvMnc0OHcifQ.eyJ2Y3QiOiJ0ZXN0LXZjdC0yIiwiY25mIjp7ImtpZCI6ImRpZDprZXk6ejZNa3ZONkhkNzlxS1dqdDhhcUxQanRHV0JYUlJSeHd5YjM3UDRvWEhUclhrdm5mI3o2TWt2TjZIZDc5cUtXanQ4YXFMUGp0R1dCWFJSUnh3eWIzN1A0b1hIVHJYa3ZuZiJ9LCJpc3MiOiJkaWQ6d2ViOjEyNy4wLjAuMTo5MDAwOnBhcmFkeW0tcHVibGljLW1ldGFkYXRhOjI3MzFlZGMwLTI3YmItNDUyZi1hYjFlLWQzYjczYjdhYWRhYyIsImlhdCI6MTcyNjY0OTU5MSwiX3NkX2FsZyI6InNoYS0yNTYifQ.-zEUcxH73-IcA9QZ71DcryjJ5WAhUarGIg3NjQ097ng0NIdd9V1Z-q_yZr-VVjThMWdu841UKakBuZQVCMTbDw~"
      ],
    })
  });
});
