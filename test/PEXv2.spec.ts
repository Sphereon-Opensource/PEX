import fs from 'fs';

import { FilterV2, PresentationDefinitionV2 } from '@sphereon/pex-models';
import { IProofType, IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types';

import { PEX, PEXv2, SelectResults, Status, Validated } from '../lib';

import {
  assertedMockCallback,
  assertedMockCallbackWithoutProofType,
  getAsyncCallbackWithoutProofType,
  getProofOptionsMock,
  getSingatureOptionsMock,
} from './test_data/PresentationSignUtilMock';
import { JwtVcs } from './test_data/jwtVcs';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = [IProofType.BbsBlsSignatureProof2020];

function getPresentationDefinitionV2_1(): PresentationDefinitionV2 {
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
      di: {
        proof_type: ['DataIntegrityProof'],
        cryptosuite: ['anoncredspresvc-2023', 'eddsa-rdfc-2022'],
      },
      di_vc: {
        proof_type: ['DataIntegrityProof'],
        cryptosuite: ['anoncredspresvc-2023', 'eddsa-rdfc-2022'],
      },
      di_vp: {
        proof_type: ['DataIntegrityProof'],
        cryptosuite: ['anoncredspresvc-2023', 'eddsa-rdfc-2022'],
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

function getPresentationDefinitionV2_2(): PresentationDefinitionV2 {
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
      di: {
        proof_type: ['DataIntegrityProof'],
        cryptosuite: ['anoncredspresvc-2023', 'eddsa-rdfc-2022'],
      },
      di_vc: {
        proof_type: ['DataIntegrityProof'],
        cryptosuite: ['anoncredspresvc-2023', 'eddsa-rdfc-2022'],
      },
      di_vp: {
        proof_type: ['DataIntegrityProof'],
        cryptosuite: ['anoncredspresvc-2023', 'eddsa-rdfc-2022'],
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
                enum: ['red'],
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

function getPresentationDefinitionV2_3(): PresentationDefinitionV2 {
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
      di: {
        proof_type: ['DataIntegrityProof'],
        cryptosuite: ['anoncredspresvc-2023', 'eddsa-rdfc-2022'],
      },
      di_vc: {
        proof_type: ['DataIntegrityProof'],
        cryptosuite: ['anoncredspresvc-2023', 'eddsa-rdfc-2022'],
      },
      di_vp: {
        proof_type: ['DataIntegrityProof'],
        cryptosuite: ['anoncredspresvc-2023', 'eddsa-rdfc-2022'],
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
                enum: ['red'],
              },
            },
            {
              path: ['$.color', '$.vc.color'],
              purpose: 'We can only verify bank accounts if they are attested by a trusted bank, auditor, or regulatory authority.',
              filter: {
                type: 'string',
                enum: ['red'],
              },
            },
            {
              path: ['$.name', '$.vc.name'],
              purpose: 'We can only verify bank accounts if they are attested by a trusted bank, auditor, or regulatory authority.',
              filter: {
                type: 'string',
                const: 'Washington State',
              },
            },
          ],
        },
      },
    ],
  };
}

describe('evaluate', () => {
  it('testing constructor', function () {
    const pex: PEXv2 = new PEXv2();
    expect(pex).toBeInstanceOf(PEXv2);
  });

  it('Evaluate presentationDefinition v2', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2_1();
    const result: Validated = PEX.validateDefinition(pd);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate presentationDefinition v2 should fail for frame', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2_1();
    pd.frame = { '@id': 'this is not valid' };
    const result: Validated = PEX.validateDefinition(pd);
    expect(result).toEqual([{ message: 'frame value is not valid', status: 'error', tag: 'presentation_definition.frame' }]);
  });

  it("Evaluate presentation submission of our vp_general's presentation_submission", () => {
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const result: Validated = PEX.validateSubmission(vpSimple.presentation_submission);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  //Credential does not contain the field
  it('should return a signed presentation with PdV2', async () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json') as IVerifiablePresentation;
    const pex: PEXv2 = new PEXv2();
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
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const pex: PEXv2 = new PEXv2();
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

  it('Evaluate selectFrom', () => {
    const pex: PEXv2 = new PEXv2();
    const pdSchema: PresentationDefinitionV2 = getFile('./test/dif_pe_examples/pdV2/vc_expiration(corrected).json').presentation_definition;
    const vc = getFile('./test/dif_pe_examples/vc/vc-PermanentResidentCard.json');
    const result = pex.selectFrom(pdSchema, [vc], {
      holderDIDs: ['FAsYneKJhWBP2n5E21ZzdY'],
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result!.errors!.length).toEqual(0);
    expect(JSON.stringify(result!.matches)).toBe(
      JSON.stringify([{ name: 'Verify Valid License', rule: 'all', vc_path: ['$.verifiableCredential[0]'] }]),
    );
    expect(result!.areRequiredCredentialsPresent).toBe('info');
  });

  it("should throw error if proofOptions doesn't have a type with v2 pd", async () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV2/vc_expiration(corrected).json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const pex: PEXv2 = new PEXv2();
    delete pdSchema.presentation_definition.input_descriptors[0].schema;
    const proofOptions = getProofOptionsMock();
    delete proofOptions['type'];
    proofOptions.typeSupportsSelectiveDisclosure = true;
    await expect(
      pex.verifiablePresentationFrom(pdSchema.presentation_definition, vpSimple.verifiableCredential!, getAsyncCallbackWithoutProofType, {
        proofOptions,
        signatureOptions: getSingatureOptionsMock(),
        holderDID: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
      }),
    ).rejects.toThrowError('Please provide a proof type if you enable selective disclosure');
  });

  it('should return ok if presentation definition with const is valid', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2_1();
    pd.input_descriptors![0].constraints!.fields![0].filter = {
      type: 'string',
      const: 'https://yourwatchful.gov/drivers-license-schema.json',
    };
    /*  const result1 = new ValidationEngine().validate([
      {
        bundler: new PresentationDefinitionV2VB('root'),
        target: pd,
      },
    ]);
    expect(result1).toEqual([
      {
        message: 'field object "filter" property must be valid json schema',
        status: 'error',
        tag: 'presentation_definition.input_descriptor[0].constraints.fields[0]',
      },
    ]);*/
    const result2 = PEX.validateDefinition(pd);
    expect(result2).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
    expect(pd.input_descriptors![0].constraints!.fields![0].filter!['const' as keyof FilterV2]).toEqual(
      'https://yourwatchful.gov/drivers-license-schema.json',
    );
  });

  it('should return ok if presentation definition with enum is valid', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2_2();
    const result = PEX.validateDefinition(pd);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
    expect(pd.input_descriptors![0].constraints!.fields![0].filter!['enum' as keyof FilterV2]).toEqual(['red']);
  });

  it('should return ok if presentation definition with enum and const are valid', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2_3();
    const result = PEX.validateDefinition(pd);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
    expect(pd.input_descriptors![0].constraints!.fields![0].filter!['enum' as keyof FilterV2]).toEqual(['red']);
  });

  it('should return ok if presentation definition @ is already escaped properly', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2_1();
    pd.input_descriptors[0].constraints!.fields = [
      {
        path: ["$['@context']", "$.vc['@context']"],
        purpose: 'We can only verify driver licensed if they have a certain context',
        filter: {
          type: 'string',
          const: 'https://eu.com/claims/DriversLicense',
        },
      },
    ];
    delete pd.input_descriptors[0].constraints!.limit_disclosure;

    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const pex: PEXv2 = new PEXv2();
    const result = pex.selectFrom(pd, [vpSimple.verifiableCredential![0]], {
      holderDIDs: ['FAsYneKJhWBP2n5E21ZzdY'],
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result.areRequiredCredentialsPresent).toBe(Status.INFO);
    expect(result.errors?.length).toEqual(0);
  });

  it('should return ok if presentation definition @ in path escapes properly', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2_1();
    pd.input_descriptors[0].constraints!.fields = [
      {
        path: ['$.@context', '$.vc.@context'],
        purpose: 'We can only verify driver licensed if they have a certain context',
        filter: {
          type: 'string',
          const: 'https://eu.com/claims/DriversLicense',
        },
      },
    ];
    delete pd.input_descriptors[0].constraints!.limit_disclosure;

    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const pex: PEXv2 = new PEXv2();
    const result = pex.selectFrom(pd, [vpSimple.verifiableCredential![0]], {
      holderDIDs: ['FAsYneKJhWBP2n5E21ZzdY'],
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result.areRequiredCredentialsPresent).toBe(Status.INFO);
    expect(result.errors?.length).toEqual(0);
  });

  it('should return ok if presentation definition @ in path escapes properly', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2_1();
    pd.input_descriptors[0].constraints!.fields = [
      {
        path: ['$..@context', '$.vc..@context'],
        purpose: 'We can only verify driver licensed if they have a certain context',
        filter: {
          type: 'string',
          const: 'https://eu.com/claims/DriversLicense',
        },
      },
    ];
    delete pd.input_descriptors[0].constraints!.limit_disclosure;

    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const pex: PEXv2 = new PEXv2();
    const result = pex.selectFrom(pd, [vpSimple.verifiableCredential![0]], {
      holderDIDs: ['FAsYneKJhWBP2n5E21ZzdY'],
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result.areRequiredCredentialsPresent).toBe(Status.INFO);
    expect(result.errors?.length).toEqual(0);
  });

  it('should pass with jwt travel badge', function () {
    const pdSchema: PresentationDefinitionV2 = {
      id: '49768857-aec0-4e9d-8392-0e2e01d20120',
      input_descriptors: [
        {
          id: 'travel_badge_issuer',
          name: 'issuer of travel badge',
          purpose: 'We can only allow badges from these issuer',
          constraints: {
            fields: [
              {
                path: ['$.vc.issuer.id', '$.issuer.id', '$.issuer'],
                filter: {
                  type: 'string',
                  enum: ['did:web:vc.transmute.world'],
                },
              },
            ],
          },
        },
        {
          id: 'travel_badge_expiration_date',
          name: 'expiration date of travel badge',
          purpose: "We can only allow badges that haven't expired",
          constraints: {
            fields: [
              {
                path: ['$.vc.expirationDate', '$.expirationDate'],
                filter: {
                  format: 'date',
                  type: 'string',
                  formatMinimum: '2020-11-4',
                },
              },
            ],
          },
        },
      ],
    };
    const pex: PEX = new PEX();
    const selectResults: SelectResults = pex.selectFrom(pdSchema, [JwtVcs.getVCs()[4]]);
    expect(selectResults.errors?.length).toEqual(0);
    expect(selectResults.matches?.length).toEqual(2);
    expect(selectResults.areRequiredCredentialsPresent).toEqual(Status.INFO);
  });

  it('should pass with jwt university degree', function () {
    const pdSchema: PresentationDefinitionV2 = {
      id: '49768857-aec0-4e9d-8392-0e2e01d20120',
      input_descriptors: [
        {
          id: 'degree_issuer',
          name: 'issuer of university degree',
          purpose: 'We can only allow degrees from these issuer',
          constraints: {
            fields: [
              {
                path: ['$.vc.issuer.id', '$.issuer.id', '$.vc.issuer'],
                filter: {
                  type: 'string',
                  enum: ['https://example.edu/issuers/565049'],
                },
              },
            ],
          },
        },
        {
          id: 'degree_issuance_date',
          name: 'issuance date of degree',
          purpose: 'we can only allow degrees issued after a certain date',
          constraints: {
            fields: [
              {
                path: ['$.vc.issuanceDate', '$.issuanceDate'],
                filter: {
                  format: 'date',
                  type: 'string',
                  formatMinimum: '2009-01-1',
                },
              },
            ],
          },
        },
        {
          id: 'degree_name',
          name: 'name of degree',
          purpose: 'we can only allow degrees with a certain name',
          constraints: {
            fields: [
              {
                path: ['$.vc.credentialSubject.degree.name', '$.credentialSubject.degree.name'],
                filter: {
                  type: 'string',
                  enum: ['Bachelor of Science and Arts'],
                },
              },
            ],
          },
        },
      ],
    };
    const pex: PEX = new PEX();
    const selectResults: SelectResults = pex.selectFrom(pdSchema, [JwtVcs.getVCs()[0]]);
    expect(selectResults.errors?.length).toEqual(0);
    expect(selectResults.matches?.length).toEqual(3);
    expect(selectResults.areRequiredCredentialsPresent).toEqual(Status.INFO);
  });

  it('should pass with age verification', async function () {
    const pdSchema: PresentationDefinitionV2 = {
      id: '5591656f-5b5d-40f8-ab5c-9041c8e3a6a0',
      name: 'Age Verification',
      purpose: 'We need to verify your age before entering a bar',
      input_descriptors: [
        {
          id: 'age-verification',
          name: 'A specific type of VC + Issuer',
          purpose: 'We want a VC of this type generated by this issuer',
          constraints: {
            statuses: {
              active: {
                directive: 'required',
              },
            },
            limit_disclosure: 'required',
            fields: [
              {
                path: ['$.issuer'],
                filter: {
                  type: 'string',
                  const: 'did:key:z6MkwXG2WjeQnNxSoynSGYU8V9j3QzP3JSqhdmkHc6SaVWoT',
                },
              },
              {
                path: ['$.credentialSubject.name'],
              },
              {
                path: ['$.credentialSubject.age'],
                predicate: 'preferred',
                filter: {
                  type: 'number',
                  minimum: 18,
                },
              },
            ],
          },
        },
      ],
      format: {
        di_vc: {
          proof_type: ['DataIntegrityProof'],
          cryptosuite: ['anoncredspresvc-2023', 'eddsa-rdfc-2022'],
        },
      },
    };

    const identityCredential: IVerifiableCredential = {
      '@context': [
        'https://www.w3.org/ns/credentials/v2',
        {
          '@vocab': 'https://www.w3.org/ns/credentials/issuer-dependent#',
        },
      ],
      type: ['VerifiableCredential'],
      issuer: 'did:key:z6MkwXG2WjeQnNxSoynSGYU8V9j3QzP3JSqhdmkHc6SaVWoT',
      credentialSubject: {
        id: 'did:key:z6MkkwiqX7BvkBbi37aNx2vJkCEYSKgHd2Jcgh4AUhi4YY1u',
        age: 28,
        sex: 'male',
        name: 'Alex',
        height: 175,
      },
      issuanceDate: '2021-03-11T11:45:22.000Z',
      proof: [
        {
          type: 'DataIntegrityProof',
          created: '2021-12-01T20:10:45.000Z',
          cryptosuite: 'anoncredsvc-2023',
          proofValue:
            'ueyJjcmVkX2RlZl9pZCI6ImRpZDprZXk6ejZNa3dYRzJXamVRbk54U295blNHWVU4VjlqM1F6UDNKU3FoZG1rSGM2U2FWV29UL2NyZWRlbnRpYWwtZGVmaW5pdGlvbiIsInJldl9yZWciOnsiYWNjdW0iOiIxIDFGMkQyMDVBMjQzNURFMzYyNTA3RUIyMEMxQzFGMzdCRkMxNURFRTY3Nzg0MkUyN0E2M0IyNjZGOUVERkZCNjggMSAyNDk1OUUwNkFBQjQ3QzhFQkM2MkI3OEZCMjgyMzJCMDA4Q0RBMEMzOURDN0JDRUI2QjA3M0EyRTI2NEYzRkU2IDEgMUUyQjgxNDA4QjE2RDdDODQyREU3NTg0QjY5MEVFMTU3MDI3MzEzOUZBNjdFNkZBMkNEQUIyMTc1OENDODAzOSAxIDA3OUI2NUZERDZFNDlFRDE0NDlEQUY2NEU5NzIyQUZENEY5RjQxMDY4NTMyNkUxMjJBNjE1OUY4MTY1NjdFMzEgMiAwOTVFNDVEREY0MTdEMDVGQjEwOTMzRkZDNjNENDc0NTQ4QjdGRkZGNzg4ODgwMkYwN0ZGRkZGRjdEMDdBOEE4IDEgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJyZXZfcmVnX2lkIjoiZGlkOmtleTp6Nk1rd1hHMldqZVFuTnhTb3luU0dZVThWOWozUXpQM0pTcWhkbWtIYzZTYVZXb1QvcmV2b2NhdGlvbi1yZWdpc3RyeSIsInNjaGVtYV9pZCI6ImRpZDprZXk6ejZNa3dYRzJXamVRbk54U295blNHWVU4VjlqM1F6UDNKU3FoZG1rSGM2U2FWV29UL3NjaGVtYSIsInNpZ25hdHVyZSI6eyJwX2NyZWRlbnRpYWwiOnsiYSI6IjUxNTQzMzM4MDk5ODcwMTYzOTM3Njk0MzI1MjQwNjI0MTczNzM2NTcwMTQ1MDUyMjU3NTgyOTkzMjYyNDYzNzIzNDQzNzg4NDQzMjAzMjE4MTY1NjA3MTMwMzc1NDE0Njg1NjMzNTg0MDIwMDI1MTQ3ODgzMzcxNTQ1ODk4ODE1Njk3MzQ0OTQ4NjY5Nzc0MDUyMDMyMDYzODY4ODc2Njg0Njg5OTA1NDg4OTMzMjI3Mjk0NTM3NTg4NjQ1MTQ5OTkzNzY2MTYyNTY2NzEwMDU4NDE5NzM0NjQ3Nzg3MjcwNjc3Mjg1NjMxMzIwNDUzMTI2NjAwMzkxNjg1MDI4NzY3NzIxNzU3NjU1OTM0ODI2MzY5NjQwNTUwNzAyNzE0NDk4NzIyNzQyNzE5OTE3NDczNzg4NTgwMDY1MDIzMTU5NTYwOTY3OTQ3NTY0MjE2OTQxNTk3OTc0NzQ5ODg1ODk0MDQ5NDAyMDQ1NjQzNjMwMzI1MTkxMzk1MTE1MTcyMzM0NDk0OTE1MTc2ODQyMTc5NDIyODk4NjAzNDk2NTExNzU2NzgxOTc1NTc5OTg2MzE0OTY3Mjk3ODM2OTk3MzMzMjg2ODY0NDU1OTc2MTM1MDg3MDg0NjExNTgwMDczMjk4MTA5NDM3OTY1MTAxNDU1MDU4OTI2NjE4MjE1NzcyMzc2NDEwNjAwMzc2NjYwMTQ2OTQxMzU0ODU3MDQ3MTA0NTYwOTg4NDQ1MDY4NDQyNzMyOTUyMzM3MzQ5NzkyMDcxODY5NTg2ODM0NDQ3OTc3MjUyMDk4MjQ0MTI2MzEwMDgzNjUwOTI0IiwiZSI6IjI1OTM0NDcyMzA1NTA2MjA1OTkwNzAyNTQ5MTQ4MDY5NzU3MTkzODI3Nzg4OTUxNTE1MjMwNjI0OTcyODU4MzEwNTY2NTgwMDcxMzMwNjc1OTE0OTk4MTY5MDU1OTE5Mzk4NzE0MzAxMjM2NzkxMzIwNjI5OTMyMzg5OTY5Njk0MjIxMzIzNTk1Njc0MjkyOTc0MTI5NzA4NTA1NTU4MzQxMjQ2ODE0NjEyNzkzMjc2NTI2OSIsIm1fMiI6IjkyOTIyOTY1MjQxMzk0MjA0NDk4NzQ5NzM5NjI1NjQ1OTk5OTYwOTk0OTcyMjg1NDczNjU5NzExODk3NjUyMTEzNDUzMDYyMDYxMDY5IiwidiI6IjY2ODI1MTIyNDQzMzc0MjYxNjYwMzYzMTMwMzE5NjU2MzYyMjU4MTY2MzU2MzQ5ODQ5NDQ4Nzk5NDA0MjUyMDM5MDQyMDYzNzQwNDUxNDMyMDg3NDE3ODIwMjI0NTMwMDY1ODg3NjAyMzkzOTM5NDg2NjAxMjQzNzU1OTM3NjUzMTczNzc0NTE1MDE5MjkwNzQ4MTM1NzY1NDUxODE5Mzc4NTMwNTA4NDUwNjYyODk5MDE1MjUxOTI5NTEwMzQ5MDU2OTAzMDgyMzk5NzM3MjUzMjAyODEyODk2MTM2MDQzMzQzNjI4NjY3MDY4ODg3MTM4MTE1MTUzODc2NTMyMTY3MDAzMTQ3MjgyMDg3MzAzNjI4MDQwNjIzNTg1OTk4OTI0NjIyODAyMDYzMDgxODQ2ODQ2MTA4OTEyMjk5MTAyNzA5NDM4NjEyNzUyOTg3NTM2MDg2OTY4ODg1NzYwODM4ODEyMzMxMTIyODExNDM4NjA3NDcwMjEwNjExNTA1MzEyNjU2NjI2NzIxNDY0MzE2NzY1MTg4OTQyNDM4OTMwMTQxMTQ5Nzc2NDM5NDk2MzM4OTkwMDI2Njg2OTk0MjYyNjMxMTQ4OTQxNjIzMjAwNDUxNDA1NjAwOTEwOTA4ODEwNDA3NTU3Mjk3Mzc1ODkzMzU4MDYyMjcwNDMyNzczMTM5NjM4Mzc0NTcwODUwNjc2NDczOTc1MjE3NjEwODE5MDg0NTE2Mzk0OTQwMTU1MjEyNTg5NzM2ODIwODkzODkyODM2NjQyNTA0NzA1MzQwOTg4MjExODYwNDE0MTEwNTIyOTY3MjY2OTk4NTU2MjIzMjU4NzY2NTM2NTI5NDk5MTc1MDk5MTExNDQxOTkyNDg3ODUyODA4Nzc4MzU0MTg1Nzk0MTU5NDI4NTUyODM4MDk4NTU1NjgxOTc2ODQ3NDkyMjg4ODQyMTM2NTQ5MDg1NjYzOTQ2NjUxMzgxNzQwMjM1MjI5OTQ2NDI1OTkzMTAzNzk5OTI2NjIzMDk3ODAzMTYxNjkyOTk4NTQ4MTk0NjY1ODg1NTA0NDU4MDc3NTE1MzA1ODY3Nzc3MzE5MTU4MDQifSwicl9jcmVkZW50aWFsIjp7ImMiOiIwMjNCMjE4M0VERUI1OUI4MENCRDNCNEIwRDE5QTZENjlFNUI2RDRDRTlDOEJGNTBGOTVCOEZDQjVBMjI4MzVDIiwiZ19pIjoiMSAxMUIwMzU5NDEzOEQ5N0UyNzExQjMxRUU1RkNDQkRENDgzNjkyQzg2N0Y3QUZCMzY5QjEyNjA2NkJCMDZEOTg1IDEgMDk3MDYxNDkyNTNEM0ZERTIwNDQ2RTQ3MzAxNUI1Q0Q3MTFGMkRCRTE3QUMyQTYwNEU1RUU3QUFGMUNGNzRGMyAyIDA5NUU0NURERjQxN0QwNUZCMTA5MzNGRkM2M0Q0NzQ1NDhCN0ZGRkY3ODg4ODAyRjA3RkZGRkZGN0QwN0E4QTgiLCJpIjo5LCJtMiI6IjEzQkY5MjRBRTI4QUFDQ0JCQzlGRjk5MURFNUEwNjU0NDQ2RDE5OEJFNkYzN0EzQjk0NEE2OUU1MzFDODdCQ0MiLCJzaWdtYSI6IjEgMTcxMEI4NjU1N0FDMDM0MURCMjJBNjFFQzAzMDdFODA2QUVDN0I3OTY0OTA1QkJDQTc1REMyNDNBRDYwMDgzQSAxIDFGNjk2QTJFRDRDQTM1RDQ5RjUyN0NGRERBQjVDM0E5QTA3RURFNkRFNEE4RTYwMkYxNTZGNUNENjQ4NjJDM0YgMiAwOTVFNDVEREY0MTdEMDVGQjEwOTMzRkZDNjNENDc0NTQ4QjdGRkZGNzg4ODgwMkYwN0ZGRkZGRjdEMDdBOEE4IiwidnJfcHJpbWVfcHJpbWUiOiIxODJEQzU5OUZFRjIzRkY4RTJDOTREMjdBOEQxQzQzOUM1RkE0OEVEODYwQ0VDQkMxOUE2NTRBQjA3M0Q4N0IzIiwid2l0bmVzc19zaWduYXR1cmUiOnsiZ19pIjoiMSAxMUIwMzU5NDEzOEQ5N0UyNzExQjMxRUU1RkNDQkRENDgzNjkyQzg2N0Y3QUZCMzY5QjEyNjA2NkJCMDZEOTg1IDEgMDk3MDYxNDkyNTNEM0ZERTIwNDQ2RTQ3MzAxNUI1Q0Q3MTFGMkRCRTE3QUMyQTYwNEU1RUU3QUFGMUNGNzRGMyAyIDA5NUU0NURERjQxN0QwNUZCMTA5MzNGRkM2M0Q0NzQ1NDhCN0ZGRkY3ODg4ODAyRjA3RkZGRkZGN0QwN0E4QTgiLCJzaWdtYV9pIjoiMSAwM0JBREM1MEIxREMzODA3MzNBQzZEQThGN0RCNUFERjc1NDNBM0E5RTQ4MDhBOUUzMjVCREFEQTc0NUI2M0IyIDEgMDhERkUyQUNCMDI3OEU3NkFDRjg3Nzk1OEIxQUQ4NjQ5QzdBNTYyNTBGNjIxMDgwM0Y4RDY1MzczODQ2NzU4RSAxIDFBNDE5QTlGQUZENTg0NkE4Nzc1QTlEQzA5MjdCMTUzM0U5QjA3RjJBRDRFMzUxREY1M0FCRjkwQkY1NzdDMjIgMSAxQTlBQTc5MTRBNERERERDNURDOEIzNkRDNDg5NURCQzZBMjZDNjZGODFCQjlFM0NFMEVCMUJCRTg4QThCNjFDIDIgMDk1RTQ1RERGNDE3RDA1RkIxMDkzM0ZGQzYzRDQ3NDU0OEI3RkZGRjc4ODg4MDJGMDdGRkZGRkY3RDA3QThBOCAxIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAiLCJ1X2kiOiIxIDBFNTM5N0Q4NUUwMkI5MTdDMjcxQzc4NTg5RDYxRkUwQjdERkI5QTUwRTdDMTEyQTM2MUI2RjQyMzc5Q0E4QzYgMSAxODBGOTFDMjUzNzk3MzU4M0FGRDM5ODUxNDNGNTc3NzYwRUI5QTJCNkRFMDY3NjM4NjQ2QkI3RDlDNEVDNjZFIDEgMTQ1OTYyODM5NzY3ODMzMzRBNEU1RTJBNjA5RTM2QzE1QTlBQUY2RDA0N0Y1QTYyMjc2NkIwODBCRjk3RDUyQSAxIDBBN0ExQzdEQTIyOTY5OTczQ0U5MjNFRjNBMzhDODlDMzU2Njg1MzFFRDY1OTE0MEJEMTlEMEY2RkQ2QkM4QzYgMiAwOTVFNDVEREY0MTdEMDVGQjEwOTMzRkZDNjNENDc0NTQ4QjdGRkZGNzg4ODgwMkYwN0ZGRkZGRjdEMDdBOEE4IDEgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCJ9fX0sInNpZ25hdHVyZV9jb3JyZWN0bmVzc19wcm9vZiI6eyJjIjoiMTA0MDEwNTA1NDczMTExMDg2MjAyMDA4ODk5NzA4MzQzNjg1OTE4MzM0ODUwMzEyMDQ4Mzg4MTk4MDc4Nzk3ODEzMTE1ODM3NTA2NDAwIiwic2UiOiI0MzU5MTgwNDQ3OTIyODc0NDk3OTU0NDIzNjMxMTAzNTQ0OTQwOTgzMjU5NzI3MjMyMjgyOTI3MjQyMzQ1NzUyODcwMjk1MTczMDc0MTM0NDU4NTU5MDIwNjI0Mzk3OTA4OTAwNDcwMzM1NzAyNjMxNjY0Njg2MjAyODQ0MzYyOTAyNjI3MjMwNDU4MjgyNDAxNjg0NTA1Mzc2NzAyMTEyMDUwNzc5MzQ1NzA2ODA2MTU2OTY4MTkzNjA4NDE2NTI1MTUwNTUxNjc3NDIwNzMyMTExMzQwMzI1MDM2MjkyMjc0MTMwMTg1ODc4MTQwNDcxNTkyNTg0ODYwNjc1MzA5ODM4MTAyMjk1MTY4NTcwOTQzODc4MTUwNzE0Njc1NDk2MTk4MDEzOTczMjk1MDYwMzU1MjEyMDQxMjA2Mzg1OTYyODEyODkyMDA0MDQ2MjgyNDIyNDAzMzk3MzAwNTc1MzQ1ODA1ODYzNDYxMDk2MDg5ODMzMjQ4NTc3OTc5MTMyMjUwNzYxMjEyODg1Mjc3MjA4MTYyMzAyMzI0MTcxMzcxNDczNzIyNDQ2MTYzMjczMDg0NDIwMDIxNDA0MjYwMjIwNTAyMTI4MzEwMjY4NDQ1ODA1OTQ5MDIwODU4OTA2NTA3NjcxNjgyNjYxNjgyMTQzMTAzNjI5MDQ5NDk3NTE0MTI5MDQwNzU4NzU4OTgxOTg4MDg5NDY5MTUzMzAxMzU3MTQ1NTcwNDUzNzUyODExNzc2NTAxMjIzMDk1MjIzOTMzMjAzNzA0NjY2NzA2NjM2Njk0MTI1ODcyNjM2OTc1MzM5MiJ9LCJ3aXRuZXNzIjp7Im9tZWdhIjoiMSAxNTNDM0RDRjRGMDFGNDkwMDNBQUM1MjY2RUU5QzczNTk3RjMxRTFCQ0QwRDVCQUMyRjBFNDFDMkI3MUJGMUM5IDEgMEVDM0QwRTMyODIyOTI4NDI4QUU1Q0U1NTg0NTVDMzZEQjIzNjJCNTVFMEUyN0QxQjE2QkYwOTczNzM1OTMwRCAxIDBCNkI2MzlGQUM3NEY4QjRBMDkwNDE4NjUyMzdGMTlDRjg3MjcyRDE0QUVENkE5QTMwRTkzMUFFNEQxQzNCNDkgMSAxQUE1NkJFNjhEMUVDRTc1MzgxNDQ5RjMwQzExQUMzQzk1NjY0RTNBQjNFMkI4Q0U5MjFFMjc1RTVDQjQ1ODlCIDIgMDk1RTQ1RERGNDE3RDA1RkIxMDkzM0ZGQzYzRDQ3NDU0OEI3RkZGRjc4ODg4MDJGMDdGRkZGRkY3RDA3QThBOCAxIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifX0',
          verificationMethod: 'did:key:z6MkwXG2WjeQnNxSoynSGYU8V9j3QzP3JSqhdmkHc6SaVWoT/credential-definition',
          proofPurpose: 'assertionMethod',
        },
      ],
    };
    const pex: PEX = new PEX();
    const selectResults: SelectResults = pex.selectFrom(pdSchema, [identityCredential]);
    expect(selectResults.errors?.length).toEqual(0);
    expect(selectResults.matches?.length).toEqual(1);
    expect(selectResults.areRequiredCredentialsPresent).toEqual(Status.INFO);

    const vpr = await pex.verifiablePresentationFrom(pdSchema, [identityCredential], assertedMockCallback, {
      proofOptions: getProofOptionsMock(),
      signatureOptions: getSingatureOptionsMock(),
    });
    expect(vpr.presentationSubmission.descriptor_map).toHaveLength(1);
    expect(vpr.presentationSubmission.descriptor_map[0].format).toEqual('di_vp');
    const vp = vpr.verifiablePresentation as IVerifiablePresentation;
    const proof = Array.isArray(vp.proof) ? vp.proof[0] : vp.proof;
    expect(proof.created).toEqual('2021-12-01T20:10:45.000Z');
    expect(proof.proofValue).toEqual('fake');
    expect(proof.verificationMethod).toEqual('did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489#key');
  });
});
