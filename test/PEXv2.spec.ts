import fs from 'fs';

import { FilterV2, PresentationDefinitionV2 } from '@sphereon/pex-models';
import { IProofType, IVerifiablePresentation } from '@sphereon/ssi-types';

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
});
