import fs from 'fs';

import { PresentationDefinitionV1, PresentationDefinitionV2 } from '@sphereon/pex-models';

import {
  IJwtVerifiableCredential,
  IPresentation,
  IVerifiableCredential,
  IVerifiablePresentation,
  PEX,
  ProofType,
  Validated,
} from '../lib';
import { SSITypesBuilder } from '../lib/types/SSITypesBuilder';

import {
  assertedMockCallback,
  assertedMockCallbackWithoutProofType,
  getErrorThrown,
  getProofOptionsMock,
  getSingatureOptionsMock,
} from './test_data/PresentationSignUtilMock';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = [ProofType.BbsBlsSignatureProof2020];

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
              purpose:
                'We can only verify bank accounts if they are attested by a trusted bank, auditor, or regulatory authority.',
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
    const pejs: PEX = new PEX();
    expect(pejs).toBeInstanceOf(PEX);
  });

  it('Evaluate case with error result', () => {
    const pejs: PEX = new PEX();
    const pdSchema: PresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-PermanentResidentCard.json'
    ).presentation_definition;
    const vc = getFile('./test/dif_pe_examples/vc/vc-PermanentResidentCard.json');
    pdSchema.input_descriptors[0].schema = [{ uri: 'https://www.example.com/schema' }];
    const result = pejs.selectFrom(pdSchema, [vc], ['FAsYneKJhWBP2n5E21ZzdY'], LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(result!.errors!.length).toEqual(2);
    expect(result!.errors!.map((e) => e.tag)).toEqual(['UriEvaluation', 'MarkForSubmissionEvaluation']);
  });

  it('Evaluate case without any error 1', () => {
    const pdSchema: PresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const pejs: PEX = new PEX();
    const evaluationResults = pejs.evaluatePresentation(pdSchema, vpSimple, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(evaluationResults!.value!.descriptor_map!.length).toEqual(1);
    expect(evaluationResults!.errors!.length).toEqual(0);
  });

  it('Evaluate case without any error 2', () => {
    const pdSchema: PresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const pejs: PEX = new PEX();
    const evaluationResults = pejs.evaluateCredentials(
      pdSchema,
      vpSimple.verifiableCredential as IVerifiableCredential[],
      [vpSimple.holder as string],
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    expect(evaluationResults!.value!.descriptor_map!.length).toEqual(1);
    expect(evaluationResults!.errors!.length).toEqual(0);
  });

  it('Evaluate submission requirements all from group A', () => {
    const pdSchema: PresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pejs: PEX = new PEX();
    pejs.evaluateCredentials(
      pdSchema,
      vpSimple.verifiableCredential as IVerifiableCredential[],
      [HOLDER_DID],
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    const presentation: IPresentation = pejs.presentationFrom(
      pdSchema,
      vpSimple.verifiableCredential as IVerifiableCredential[],
      HOLDER_DID
    );
    expect(presentation.presentation_submission).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'ldp_vc', id: 'Educational transcripts', path: '$.verifiableCredential[0]' },
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[1]' },
          { format: 'ldp_vc', id: 'Educational transcripts 2', path: '$.verifiableCredential[2]' },
        ],
      })
    );
    expect(presentation.holder).toEqual(HOLDER_DID);
    expect(presentation.verifiableCredential).toEqual(vpSimple.verifiableCredential);
    expect(presentation.type).toEqual(['VerifiablePresentation', 'PresentationSubmission']);
    expect(presentation['@context']).toEqual([
      'https://www.w3.org/2018/credentials/v1',
      'https://identity.foundation/presentation-exchange/submission/v1',
    ]);
  });

  it('Evaluate pdV1 schema of our sr_rules.json pdV1', () => {
    const pdSchema: PresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pejs: PEX = new PEX();
    const result: Validated = pejs.validateDefinition(pdSchema);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate presentationDefinition v2', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2();
    const pejs: PEX = new PEX();
    const result: Validated = pejs.validateDefinition(pd);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate presentationDefinition v2 should fail for frame', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2();
    pd.frame = { '@id': 'this is not valid' };
    const pejs: PEX = new PEX();
    const result: Validated = pejs.validateDefinition(pd);
    expect(result).toEqual([
      { message: 'frame value is not valid', status: 'error', tag: 'presentation_definition.frame' },
    ]);
  });

  it("Evaluate presentation submission of our vp_general's presentation_submission", () => {
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const pejs: PEX = new PEX();
    const result: Validated = pejs.validateSubmission(vpSimple.presentation_submission);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate pdV1 schema of our pd_driver_license_name.json pdV1', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const pejs: PEX = new PEX();
    const result: Validated = pejs.validateDefinition(pdSchema.presentation_definition);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('should return a signed presentation', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json') as IVerifiablePresentation;
    const pejs: PEX = new PEX();
    const vp: IVerifiablePresentation = pejs.verifiablePresentationFrom(
      pdSchema.presentation_definition,
      vpSimple.verifiableCredential as IVerifiableCredential[],
      assertedMockCallback,
      {
        proofOptions: getProofOptionsMock(),
        signatureOptions: getSingatureOptionsMock(),
        holder: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
      }
    );
    const proof = Array.isArray(vp.proof) ? vp.proof[0] : vp.proof;
    expect(proof.created).toEqual('2021-12-01T20:10:45.000Z');
    expect(proof.proofValue).toEqual('fake');
    expect(proof.verificationMethod).toEqual('did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489#key');
  });

  it('should return a signed presentation with PdV2', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json') as IVerifiablePresentation;
    const pejs: PEX = new PEX();
    delete pdSchema.presentation_definition.input_descriptors[0].schema;
    const vp: IVerifiablePresentation = pejs.verifiablePresentationFrom(
      pdSchema.presentation_definition,
      vpSimple.verifiableCredential as IVerifiableCredential[],
      assertedMockCallback,
      {
        proofOptions: getProofOptionsMock(),
        signatureOptions: getSingatureOptionsMock(),
        holder: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
      }
    );
    const proof = Array.isArray(vp.proof) ? vp.proof[0] : vp.proof;
    expect(proof.created).toEqual('2021-12-01T20:10:45.000Z');
    expect(proof.proofValue).toEqual('fake');
    expect(proof.verificationMethod).toEqual('did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489#key');
  });

  it("should throw error if proofOptions doesn't have a type", () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const pejs: PEX = new PEX();
    delete pdSchema.presentation_definition.input_descriptors[0].schema;
    const proofOptions = getProofOptionsMock();
    delete proofOptions['type'];
    proofOptions.typeSupportsSelectiveDisclosure = true;
    expect(() =>
      pejs.verifiablePresentationFrom(
        pdSchema.presentation_definition,
        vpSimple.verifiableCredential as IVerifiableCredential[],
        assertedMockCallbackWithoutProofType,
        {
          proofOptions,
          signatureOptions: getSingatureOptionsMock(),
          holder: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
        }
      )
    ).toThrowError('Please provide a proof type if you enable selective disclosure');
  });

  it('should throw exception if signing encounters a problem', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const pejs: PEX = new PEX();

    expect(() => {
      pejs.verifiablePresentationFrom(
        pdSchema.presentation_definition,
        vpSimple.verifiableCredential as IVerifiableCredential[],
        getErrorThrown,
        {
          proofOptions: getProofOptionsMock(),
          signatureOptions: getSingatureOptionsMock(),
        }
      );
    }).toThrow(Error);
  });

  it('should return v1 when calling version discovery', function () {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const pejs: PEX = new PEX();
    const result = pejs.definitionVersionDiscovery(pdSchema.presentation_definition);
    expect(result.version).toEqual('v1');
  });

  it('should return v2 when calling version discovery', function () {
    const pdSchema = getPresentationDefinitionV2();
    const pejs: PEX = new PEX();
    const result = pejs.definitionVersionDiscovery(pdSchema);
    expect(result.version).toEqual('v2');
  });

  it('should return error when called with a mixed version', function () {
    const pdSchema = getPresentationDefinitionV2();
    (pdSchema as PresentationDefinitionV1).input_descriptors[0]['schema'] = [{ uri: 'schema' }];
    const pejs: PEX = new PEX();
    const result = pejs.definitionVersionDiscovery(pdSchema);
    expect(result.error).toEqual('This is not a valid PresentationDefinition');
  });

  it('should return v2 when calling without schema', function () {
    const pdSchema = getPresentationDefinitionV2();
    delete pdSchema.frame;
    const pejs: PEX = new PEX();
    const result = pejs.definitionVersionDiscovery(pdSchema);
    expect(result.version).toEqual('v2');
  });

  it('should set expiration date if exp is present in JWT vc', () => {
    const jwtVc: IJwtVerifiableCredential = getFile('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc.exp = (+new Date()).toString();
    const vcs = SSITypesBuilder.mapExternalVerifiableCredentialsToInternal([jwtVc]);
    expect(vcs[0].getBaseCredential().credentialSubject.expirationDate).toEqual(
      new Date(parseInt(jwtVc.exp)).toISOString()
    );
  });

  it('should set expiration date if exp is present in JWT vc as number', () => {
    const jwtVc: IJwtVerifiableCredential = getFile('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];

    jwtVc.exp = new Date().valueOf();
    const vcs = SSITypesBuilder.mapExternalVerifiableCredentialsToInternal([jwtVc]);
    expect(vcs[0].getBaseCredential().credentialSubject.expirationDate).toEqual(new Date(jwtVc.exp).toISOString());
  });

  it('should throw an error if expiration date and exp are different in JWT vc', () => {
    const jwtVc: IJwtVerifiableCredential = getFile('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc.exp = (+new Date()).toString();
    jwtVc.vc.credentialSubject.expirationDate = (+new Date(jwtVc.exp + 2)).toString();
    expect(() => SSITypesBuilder.mapExternalVerifiableCredentialsToInternal([jwtVc])).toThrowError(
      `Inconsistent expiration dates between JWT claim (${new Date(parseInt(jwtVc.exp)).toISOString()}) and VC value (${
        jwtVc.vc.credentialSubject.expirationDate
      })`
    );
  });

  it('should set issuer if iss is present in JWT vc', () => {
    const jwtVc: IJwtVerifiableCredential = getFile('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete jwtVc.vc.issuer;
    const vcs = SSITypesBuilder.mapExternalVerifiableCredentialsToInternal([jwtVc]);
    expect(vcs[0].getBaseCredential().issuer).toEqual(jwtVc.iss);
  });

  it('should throw an error if issuer and iss are different in JWT vc', () => {
    const jwtVc: IJwtVerifiableCredential = getFile('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc.iss = 'did:test:456';
    expect(() => SSITypesBuilder.mapExternalVerifiableCredentialsToInternal([jwtVc])).toThrowError(
      `Inconsistent issuers between JWT claim (${jwtVc.iss}) and VC value (${jwtVc.vc.issuer})`
    );
  });

  it('should set issuance date if nbf is present in JWT vc', () => {
    const jwtVc: IJwtVerifiableCredential = getFile('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc.nbf = (+new Date()).toString();
    jwtVc.vc.issuanceDate = new Date(parseInt(jwtVc.nbf)).toISOString();
    const vcs = SSITypesBuilder.mapExternalVerifiableCredentialsToInternal([jwtVc]);
    expect(vcs[0].getBaseCredential().issuanceDate).toEqual(new Date(parseInt(jwtVc.nbf)).toISOString());
  });

  it('should throw an error if issuance date and nbf are different in JWT vc', () => {
    const jwtVc: IJwtVerifiableCredential = getFile('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    const nbf = new Date().valueOf();
    jwtVc.nbf = nbf / 1000;
    jwtVc.vc.issuanceDate = new Date(+new Date() + 2).toISOString();
    expect(() => SSITypesBuilder.mapExternalVerifiableCredentialsToInternal([jwtVc])).toThrowError(
      `Inconsistent issuance dates between JWT claim (${new Date(nbf)
        .toISOString()
        .replace(/\.\d\d\dZ/, 'Z')}) and VC value (${jwtVc.vc.issuanceDate})`
    );
  });

  it('should set credentialSubject.id if sub is present in JWT vc', () => {
    const jwtVc: IJwtVerifiableCredential = getFile('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc.sub = jwtVc.vc.credentialSubject.id;
    const vcs = SSITypesBuilder.mapExternalVerifiableCredentialsToInternal([jwtVc]);
    expect(vcs[0].getBaseCredential().credentialSubject.id).toEqual(jwtVc.sub);
  });

  it('should throw an error if credentialSubject.id and sub are different in JWT vc', () => {
    const jwtVc: IJwtVerifiableCredential = getFile('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc.sub = 'did:test:123';
    expect(() => SSITypesBuilder.mapExternalVerifiableCredentialsToInternal([jwtVc])).toThrowError(
      `Inconsistent credential subject ids between JWT claim (${jwtVc.sub}) and VC value (${jwtVc.vc.credentialSubject.id})`
    );
  });

  it('should set id if jti is present in JWT vc', () => {
    const jwtVc: IJwtVerifiableCredential = getFile('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc.jti = jwtVc.vc.id;
    const vcs = SSITypesBuilder.mapExternalVerifiableCredentialsToInternal([jwtVc]);
    expect(vcs[0].getBaseCredential().id).toEqual(jwtVc.jti);
  });

  it('should throw an error if id and jti are different in JWT vc', () => {
    const jwtVc: IJwtVerifiableCredential = getFile('test/dif_pe_examples/vp/vp_general.json').verifiableCredential[0];
    jwtVc.jti = 'test';
    expect(() => SSITypesBuilder.mapExternalVerifiableCredentialsToInternal([jwtVc])).toThrowError(
      `Inconsistent credential ids between JWT claim (${jwtVc.jti}) and VC value (${jwtVc.vc.id})`
    );
  });

  it('should throw error when calling with mixed version', function () {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd_driver_license_name.json').presentation_definition;
    pdSchema.input_descriptors[0].constraints!.fields[0]['filter'] = {
      type: 'string',
      format: 'date-time',
      formatExclusiveMinimum: '2013-01-01T00:00Z',
    };
    const pejs: PEX = new PEX();
    const result = pejs.definitionVersionDiscovery(pdSchema);
    expect(result.error).toEqual('This is not a valid PresentationDefinition');
  });
});
