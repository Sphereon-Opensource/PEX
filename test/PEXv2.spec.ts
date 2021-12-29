import fs from 'fs';

import { PresentationDefinitionV2 } from '@sphereon/pex-models';

import { PEXv2, Validated, VerifiablePresentation } from '../lib';

import {
  assertedMockCallback,
  getProofOptionsMock,
  getSingatureOptionsMock,
} from './test_data/PresentationSignUtilMock';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

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
    const pex: PEXv2 = new PEXv2();
    expect(pex).toBeInstanceOf(PEXv2);
  });

  it('Evaluate presentationDefinition v2', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2();
    const pex: PEXv2 = new PEXv2();
    const result: Validated = pex.validateDefinition(pd);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate presentationDefinition v2 should fail for frame', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2();
    pd.frame = { '@id': 'this is not valid' };
    const pex: PEXv2 = new PEXv2();
    const result: Validated = pex.validateDefinition(pd);
    expect(result).toEqual([
      { message: 'frame value is not valid', status: 'error', tag: 'presentation_definition.frame' },
    ]);
  });

  it("Evaluate presentation submission of our vp_general's presentation_submission", () => {
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const pex: PEXv2 = new PEXv2();
    const result: Validated = pex.validateSubmission(vpSimple.presentation_submission);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('should return a signed presentation with PdV2', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as VerifiablePresentation;
    const pex: PEXv2 = new PEXv2();
    delete pdSchema.presentation_definition.input_descriptors[0].schema;
    const vp: VerifiablePresentation = pex.verifiablePresentationFrom(
      pdSchema.presentation_definition,
      vpSimple.verifiableCredential,
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
});
