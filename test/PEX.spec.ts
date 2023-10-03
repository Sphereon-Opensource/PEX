import fs from 'fs';

import { PresentationDefinitionV1, PresentationDefinitionV2 } from '@sphereon/pex-models';
import {
  ICredential,
  ICredentialSubject,
  IProofType,
  IVerifiableCredential,
  IVerifiablePresentation,
  WrappedVerifiablePresentation,
} from '@sphereon/ssi-types';

import { EvaluationResults, PEX, Validated } from '../lib';
import { VerifiablePresentationResult } from '../lib/signing/types';
import { SSITypesBuilder } from '../lib/types';

import {
  assertedMockCallback,
  assertedMockCallbackWithoutProofType,
  getAsyncCallbackWithoutProofType,
  getErrorThrown,
  getProofOptionsMock,
  getSingatureOptionsMock,
} from './test_data/PresentationSignUtilMock';

function getFile(path: string) {
  return fs.readFileSync(path, 'utf-8');
}

function getFileAsJson(path: string) {
  return JSON.parse(getFile(path));
}

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = [IProofType.BbsBlsSignatureProof2020];

function getPresentationDefinitionV2(): PresentationDefinitionV2 {
  return {
    id: '32f54163-7166-48f1-93d8-ff217bdb0653',
    name: 'Conference Entry Requirements',
    purpose: 'We can only allow people associated with Washington State business representatives into conference areas',
    format: {
      jwt: {
        alg: ['ES384'],
      },
      jwt_vc: {
        alg: ['ES384'],
      },
      jwt_vp: {
        alg: ['ES384'],
      },
      ldp_vc: {
        proof_type: ['JsonWebSignature2020', 'Ed25519Signature2018', 'EcdsaSecp256k1Signature2019', 'RsaSignature2018'],
      },
      ldp_vp: {
        proof_type: ['Ed25519Signature2018'],
      },
      ldp: {
        proof_type: ['RsaSignature2018'],
      },
    },
    input_descriptors: [
      {
        id: 'wa_driver_license',
        name: 'Washington State Business License',
        purpose: 'We can only allow licensed Washington State business representatives into the WA Business Conference',
        constraints: {
          limit_disclosure: 'required',
          fields: [
            {
              path: ['$.issuer', '$.vc.issuer', '$.iss'],
              purpose: 'We can only verify bank accounts if they are attested by a trusted bank, auditor, or regulatory authority.',
              filter: {
                type: 'string',
                pattern: 'did:example:123|did:example:456',
              },
            },
          ],
        },
      },
    ],
    frame: {
      '@context': {
        '@vocab': 'http://example.org/',
        within: { '@reverse': 'contains' },
      },
      '@type': 'Chapter',
      within: {
        '@type': 'Book',
        within: {
          '@type': 'Library',
        },
      },
    },
  };
}

describe('evaluate', () => {
  it('testing constructor', function () {
    const pex: PEX = new PEX();
    expect(pex).toBeInstanceOf(PEX);
  });

  it('Evaluate case with error result', () => {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV1 = getFileAsJson('./test/dif_pe_examples/pdV1/pd-PermanentResidentCard.json').presentation_definition;
    const vc = getFileAsJson('./test/dif_pe_examples/vc/vc-PermanentResidentCard.json');
    pdSchema.input_descriptors[0].schema = [{ uri: 'https://www.example.com/schema' }];
    const result = pex.selectFrom(pdSchema, [vc], {
      holderDIDs: ['FAsYneKJhWBP2n5E21ZzdY'],
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result!.errors!.length).toEqual(2);
    expect(result!.errors!.map((e) => e.tag)).toEqual(['UriEvaluation', 'MarkForSubmissionEvaluation']);
  });

  it('Evaluate case without any error 1', () => {
    const pdSchema: PresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const pex: PEX = new PEX();
    const evaluationResults = pex.evaluatePresentation(pdSchema, vpSimple, { limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES });
    expect(evaluationResults!.value!.descriptor_map!.length).toEqual(1);
    expect(evaluationResults!.errors!.length).toEqual(0);
  });

  it('Evaluate case with error. No submission data', () => {
    const pdSchema: PresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });

    // Delete the submission to trigger an error
    delete vpSimple.presentation_submission;
    const pex: PEX = new PEX();
    expect(() => pex.evaluatePresentation(pdSchema, vpSimple, { limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES })).toThrowError(
      'Either a presentation submission as part of the VP or provided separately was expected',
    );
  });

  it('Evaluate case without any error 2', () => {
    const pdSchema: PresentationDefinitionV1 = getFileAsJson(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const pex: PEX = new PEX();
    const evaluationResults = pex.evaluateCredentials(pdSchema, vpSimple.verifiableCredential!, {
      holderDIDs: [vpSimple.holder as string],
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(evaluationResults!.value!.descriptor_map!.length).toEqual(1);
    expect(evaluationResults!.errors!.length).toEqual(0);
  });

  it('Evaluate submission requirements all from group A', () => {
    const pdSchema: PresentationDefinitionV1 = getFileAsJson('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFileAsJson('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pex: PEX = new PEX();
    pex.evaluateCredentials(pdSchema, vpSimple.verifiableCredential!, {
      holderDIDs: [HOLDER_DID],
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result = pex.presentationFrom(pdSchema, vpSimple.verifiableCredential!, { holderDID: HOLDER_DID });
    const presentation = result.presentation;
    expect(presentation.presentation_submission).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'jwt_vc', id: 'Educational transcripts', path: '$.verifiableCredential[0]' },
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[1]' },
          { format: 'ldp_vc', id: 'Educational transcripts 2', path: '$.verifiableCredential[2]' },
        ],
      }),
    );
    expect(presentation.holder).toEqual(HOLDER_DID);
    expect(presentation.verifiableCredential).toEqual(vpSimple.verifiableCredential!);
    expect(presentation.type).toEqual(['VerifiablePresentation', 'PresentationSubmission']);
    expect(presentation['@context']).toEqual([
      'https://www.w3.org/2018/credentials/v1',
      'https://identity.foundation/presentation-exchange/submission/v1',
    ]);
  });

  it('Evaluate pdV1 schema of our sr_rules.json pdV1', () => {
    const pdSchema: PresentationDefinitionV1 = getFileAsJson('./test/resources/sr_rules.json').presentation_definition;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const result: Validated = PEX.validateDefinition(pdSchema);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate presentationDefinition v2', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2();
    const result: Validated = PEX.validateDefinition(pd);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate presentationDefinition v2 should fail for frame', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2();
    pd.frame = { '@id': 'this is not valid' };
    const result: Validated = PEX.validateDefinition(pd);
    expect(result).toEqual([
      {
        message: 'frame value is not valid',
        status: 'error',
        tag: 'presentation_definition.frame',
      },
    ]);
  });

  it("Evaluate presentation submission of our vp_general's presentation_submission", () => {
    const vpSimple = getFileAsJson('./test/dif_pe_examples/vp/vp_general.json');
    const result: Validated = PEX.validateSubmission(vpSimple.presentation_submission);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate pdV1 schema of our pd_driver_license_name.json pdV1', () => {
    const pdSchema = getFileAsJson('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const result: Validated = PEX.validateDefinition(pdSchema.presentation_definition);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('should return a signed presentation', async () => {
    const pdSchema = getFileAsJson('./test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json');
    const vpSimple = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json') as IVerifiablePresentation;
    const pex: PEX = new PEX();
    const vpr: VerifiablePresentationResult = await pex.verifiablePresentationFrom(
      pdSchema.presentation_definition,
      vpSimple.verifiableCredential!,
      assertedMockCallback,
      {
        proofOptions: getProofOptionsMock(),
        signatureOptions: getSingatureOptionsMock(),
        holderDID: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
      },
    );
    const vp = vpr.verifiablePresentation as IVerifiablePresentation;
    const proof = Array.isArray(vp.proof) ? vp.proof[0] : vp.proof;
    expect(proof.created).toEqual('2021-12-01T20:10:45.000Z');
    expect(proof.proofValue).toEqual('fake');
    expect(proof.verificationMethod).toEqual('did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489#key');
  });

  it('should return a signed presentation with PdV2', async () => {
    const pdSchema = getFileAsJson('./test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json');
    const vpSimple = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json') as IVerifiablePresentation;
    const pex: PEX = new PEX();
    delete pdSchema.presentation_definition.input_descriptors[0].schema;
    const vpr = await pex.verifiablePresentationFrom(pdSchema.presentation_definition, vpSimple.verifiableCredential!, assertedMockCallback, {
      proofOptions: getProofOptionsMock(),
      signatureOptions: getSingatureOptionsMock(),
      holderDID: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
    });
    const vp = vpr.verifiablePresentation as IVerifiablePresentation;
    const proof = Array.isArray(vp.proof) ? vp.proof[0] : vp.proof;
    expect(proof.created).toEqual('2021-12-01T20:10:45.000Z');
    expect(proof.proofValue).toEqual('fake');
    expect(proof.verificationMethod).toEqual('did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489#key');
  });

  it("should throw error if proofOptions doesn't have a type", async () => {
    const pdSchema = getFileAsJson('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const vpSimple = getFileAsJson('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const pex: PEX = new PEX();
    delete pdSchema.presentation_definition.input_descriptors[0].schema;
    const proofOptions = getProofOptionsMock();
    delete proofOptions['type'];
    proofOptions.typeSupportsSelectiveDisclosure = true;
    await expect(() =>
      pex.verifiablePresentationFrom(pdSchema.presentation_definition, vpSimple.verifiableCredential!, assertedMockCallbackWithoutProofType, {
        proofOptions,
        signatureOptions: getSingatureOptionsMock(),
        holderDID: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
      }),
    ).rejects.toThrowError('Please provide a proof type if you enable selective disclosure');
  });

  it('should throw exception if signing encounters a problem', async () => {
    const pdSchema = getFileAsJson('./test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json');
    const vpSimple = getFileAsJson('./test/dif_pe_examples/vp/vp-simple-age-predicate.json') as IVerifiablePresentation;
    const pex: PEX = new PEX();

    await expect(async () => {
      await pex.verifiablePresentationFrom(pdSchema.presentation_definition, vpSimple.verifiableCredential!, getErrorThrown, {
        proofOptions: getProofOptionsMock(),
        signatureOptions: getSingatureOptionsMock(),
        holderDID: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
      });
    }).rejects.toThrow();
  });

  it('should return v1 when calling version discovery', function () {
    const pdSchema = getFileAsJson('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const result = PEX.definitionVersionDiscovery(pdSchema.presentation_definition);
    expect(result.version).toEqual('v1');
  });

  it('should return v2 when calling version discovery', function () {
    const pdSchema = getPresentationDefinitionV2();
    const result = PEX.definitionVersionDiscovery(pdSchema);
    expect(result.version).toEqual('v2');
  });

  it('should return error when called with a mixed version', function () {
    const pdSchema = getPresentationDefinitionV2();
    (pdSchema as PresentationDefinitionV1).input_descriptors[0]['schema'] = [{ uri: 'schema' }];
    const result = PEX.definitionVersionDiscovery(pdSchema);
    expect(result.error).toEqual('This is not a valid PresentationDefinition');
  });

  it('should return v2 when calling without schema', function () {
    const pdSchema = getPresentationDefinitionV2();
    delete pdSchema.frame;
    const result = PEX.definitionVersionDiscovery(pdSchema);
    expect(result.version).toEqual('v2');
  });

  it('should set expiration date if exp is present in JWT vc', () => {
    const jwtVc: IVerifiableCredential = getFileAsJson('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc['exp' as keyof IVerifiableCredential] = (+new Date()).toString();
    const vcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([jwtVc]);
    expect(vcs[0].credential!.expirationDate).toEqual(new Date(parseInt(jwtVc['exp' as keyof IVerifiableCredential] as string)).toISOString());
  });

  it('should set expiration date if exp is present in JWT vc as number', () => {
    const jwtVc: IVerifiableCredential = getFileAsJson('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];

    jwtVc['exp' as keyof IVerifiableCredential] = new Date().valueOf();
    const vcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([jwtVc]);
    expect(vcs[0].credential.expirationDate).toEqual(new Date(jwtVc['exp' as keyof IVerifiableCredential] as string).toISOString());
  });

  it('should throw an error if expiration date and exp are different in JWT vc', () => {
    const jwtVc: IVerifiableCredential = getFileAsJson('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    const now = new Date();
    jwtVc['exp'] = now.valueOf();
    jwtVc['vc'].expirationDate = new Date(now.getTime() + 2000).toString();
    expect(() => SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([jwtVc])).toThrowError(
      `Inconsistent expiration dates between JWT claim (${new Date(jwtVc['exp']).toISOString()}) and VC value (${jwtVc['vc'].expirationDate})`,
    );
  });

  it('should set issuer if iss is present in JWT vc', () => {
    const jwtVc: IVerifiableCredential = getFileAsJson('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    (<ICredential>jwtVc['vc' as keyof IVerifiableCredential]).issuer;
    const vcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([jwtVc]);
    expect(vcs[0].credential.issuer).toEqual(jwtVc['iss' as keyof IVerifiableCredential]);
  });

  it('should throw an error if issuer and iss are different in JWT vc', () => {
    const jwtVc: IVerifiableCredential = getFileAsJson('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc['iss' as keyof IVerifiableCredential] = 'did:test:456';
    expect(() => SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([jwtVc])).toThrowError(
      `Inconsistent issuers between JWT claim (${jwtVc['iss' as keyof IVerifiableCredential]}) and VC value (${
        (<ICredential>jwtVc['vc' as keyof IVerifiableCredential]).issuer
      })`,
    );
  });

  it('should set issuance date if nbf is present in JWT vc', () => {
    const jwtVc: IVerifiableCredential = getFileAsJson('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc['nbf' as keyof IVerifiableCredential] = (+new Date()).toString();
    (<ICredential>jwtVc['vc' as keyof IVerifiableCredential]).issuanceDate = new Date(
      parseInt(jwtVc['nbf' as keyof IVerifiableCredential] as string),
    ).toISOString();
    const vcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([jwtVc]);
    expect(vcs[0].credential.issuanceDate).toEqual(new Date(parseInt(jwtVc['nbf' as keyof IVerifiableCredential] as string)).toISOString());
  });

  it('should throw an error if issuance date and nbf are different in JWT vc', () => {
    const jwtVc: IVerifiableCredential = getFileAsJson('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    const nbf = new Date().valueOf();
    jwtVc['nbf' as keyof IVerifiableCredential] = nbf / 1000;
    (<ICredential>jwtVc['vc' as keyof IVerifiableCredential]).issuanceDate = new Date(+new Date() + 2000).toISOString();
    expect(() => SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([jwtVc])).toThrowError(
      `Inconsistent issuance dates between JWT claim (${new Date(nbf).toISOString().replace(/\.\d\d\dZ/, 'Z')}) and VC value (${
        (<ICredential>jwtVc['vc' as keyof IVerifiableCredential]).issuanceDate
      })`,
    );
  });

  it('should set credentialSubject.id if sub is present in JWT vc', () => {
    const jwtVc: IVerifiableCredential = getFileAsJson('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc['sub' as keyof IVerifiableCredential] = (
      (<ICredential>jwtVc['vc' as keyof IVerifiableCredential]).credentialSubject as ICredentialSubject
    ).id;
    const wvcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([jwtVc]);
    expect((wvcs[0].credential.credentialSubject as ICredentialSubject).id).toEqual(jwtVc['sub' as keyof IVerifiableCredential]);
  });

  it('should throw an error if credentialSubject.id and sub are different in JWT vc', () => {
    const jwtVc: IVerifiableCredential = getFileAsJson('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc['sub' as keyof IVerifiableCredential] = 'did:test:123';
    expect(() => SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([jwtVc])).toThrowError(
      `Inconsistent credential subject ids between JWT claim (${jwtVc['sub' as keyof IVerifiableCredential]}) and VC value (${
        ((<ICredential>jwtVc['vc' as keyof IVerifiableCredential]).credentialSubject as ICredentialSubject).id
      })`,
    );
  });

  it('should set id if jti is present in JWT vc', () => {
    const jwtVc: IVerifiableCredential = getFileAsJson('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc['jti' as keyof IVerifiableCredential] = (<ICredential>jwtVc['vc' as keyof IVerifiableCredential]).id;
    const wvcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([jwtVc]);
    expect(wvcs[0].credential.id).toEqual(jwtVc['jti' as keyof IVerifiableCredential]);
  });

  it('should throw an error if id and jti are different in JWT vc', () => {
    const jwtVc: IVerifiableCredential = getFileAsJson('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc['jti' as keyof IVerifiableCredential] = 'test';
    expect(() => SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([jwtVc])).toThrowError(
      `Inconsistent credential ids between JWT claim (${jwtVc['jti' as keyof IVerifiableCredential]}) and VC value (${
        (<ICredential>jwtVc['vc' as keyof IVerifiableCredential]).id
      })`,
    );
  });

  it('should throw error when calling with mixed version', function () {
    const pdSchema = getFileAsJson('./test/dif_pe_examples/pdV1/pd_driver_license_name.json').presentation_definition;
    pdSchema.input_descriptors[0].constraints!.fields[0]['filter'] = {
      type: 'string',
      format: 'date-time',
      formatExclusiveMinimum: '2013-01-01T00:00Z',
    };
    const result = PEX.definitionVersionDiscovery(pdSchema);
    expect(result.error).toEqual('This is not a valid PresentationDefinition');
  });

  it('should pass with jwt vp with submission data', function () {
    const pdSchema: PresentationDefinitionV2 = {
      id: '49768857',
      input_descriptors: [
        {
          id: 'prc_type',
          name: 'Name',
          purpose: 'We can only support a familyName in a Permanent Resident Card',
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.familyName'],
                filter: {
                  type: 'string',
                  const: 'Pasteur',
                },
              },
            ],
          },
        },
      ],
    };
    const pex: PEX = new PEX();
    const jwtEncodedVp = getFile('./test/dif_pe_examples/vp/vp_permanentResidentCard.jwt');
    const evalResult: EvaluationResults = pex.evaluatePresentation(pdSchema, jwtEncodedVp);
    expect(evalResult.errors).toEqual([]);
    expect(evalResult.value?.descriptor_map[0]).toEqual({
      id: '1',
      format: 'ldp_vc',
      path: '$.verifiableCredential[0]',
    });
  });

  it('should not pass with jwt vp without submission data', function () {
    const pdSchema: PresentationDefinitionV2 = {
      id: '49768857-aec0-4e9d-8392-0e2e01d20120',
      input_descriptors: [
        {
          id: 'universityDegree_type',
          name: 'Type of university degree',
          purpose: 'We can only support certain type of university degrees',
          constraints: {
            fields: [
              {
                path: ['$.vc.credentialSubject.degree.type'],
                filter: {
                  type: 'string',
                  enum: ['BachelorDegree', 'MasterDegree', 'AssociateDegree', 'DoctorateDegree'],
                },
              },
            ],
          },
        },
      ],
    };
    const pex: PEX = new PEX();
    const jwtEncodedVp = getFile('./test/dif_pe_examples/vp/vp_universityDegree.jwt');
    const evalResult: EvaluationResults = pex.evaluatePresentation(pdSchema, jwtEncodedVp, { generatePresentationSubmission: true });
    expect(evalResult.errors).toEqual([]);
    expect(evalResult.value?.descriptor_map[0]).toEqual({
      id: 'universityDegree_type',
      format: 'jwt_vc',
      path: '$.verifiableCredential[0]',
    });
  });

  it('should resolve callback promise', async () => {
    const pdSchema: PresentationDefinitionV2 = {
      id: '49768857-aec0-4e9d-8392-0e2e01d20120',
      input_descriptors: [
        {
          id: 'universityDegree_type',
          name: 'Type of university degree',
          purpose: 'We can only support certain type of university degrees',
          constraints: {
            fields: [
              {
                path: ['$.vc.credentialSubject.degree.type'],
                filter: {
                  type: 'string',
                  enum: ['BachelorDegree', 'MasterDegree', 'AssociateDegree', 'DoctorateDegree'],
                },
              },
            ],
          },
        },
      ],
    };
    const jwtEncodedVp = getFile('./test/dif_pe_examples/vp/vp_universityDegree.jwt');
    const wvp: WrappedVerifiablePresentation = SSITypesBuilder.mapExternalVerifiablePresentationToWrappedVP(jwtEncodedVp);
    const pex: PEX = new PEX();
    const vpr = await pex.verifiablePresentationFrom(pdSchema, [wvp.vcs[0].original], getAsyncCallbackWithoutProofType, {
      proofOptions: getProofOptionsMock(),
      signatureOptions: getSingatureOptionsMock(),
    });
    const vp = vpr.verifiablePresentation as IVerifiablePresentation;
    expect(vp.verifiableCredential?.length).toEqual(1);
    expect(vp.presentation_submission?.descriptor_map).toEqual([
      {
        format: 'jwt_vc',
        id: 'universityDegree_type',
        path: '$.verifiableCredential[0]',
      },
    ]);
  });
});
