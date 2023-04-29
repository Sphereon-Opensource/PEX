import { FilterV1, PresentationDefinitionV1 } from '@sphereon/pex-models';
import { IVerifiableCredential } from '@sphereon/ssi-types';

import { PEX, PEXv1, Status } from '../../lib';

function getVerifiableCredentials(): IVerifiableCredential[] {
  return [
    {
      id: '',
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
      credentialSubject: {
        alumniOf: {
          id: 'did:web:samplesite.com',
          name: [
            {
              value: 'Example University',
              lang: 'en',
            },
            {
              value: "Exemple d'Université",
              lang: 'fr',
            },
          ],
        },
        id: 'did:key:z6Mksg8XF5K6m9wHpKgyJAY4A7GhtomRBY7Dd3RwBZcRKjau',
      },
      issuer: {
        id: 'did:web:samplesite.com',
      },
      type: ['VerifiableCredential', 'AlumniCredential'],
      issuanceDate: '2022-08-11T08:39:49.000Z',
      proof: {
        type: 'Ed25519Signature2018',
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
        created: '2021-11-16T14:52:19.514Z',
        jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..nV_x5AKqH9M0u5wsEt1D_DXxYpOzuO_nqDEj-alIzPA5yi8_yWAhKbWPa2r9GoTLPehvZrpgleUDiDj-9_F6Bg',
      },
    },
  ];
}

// path: ["$.type"],
function getPresentationDefinition_original(): PresentationDefinitionV1 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    input_descriptors: [
      {
        id: 'A specific type of VC',
        name: 'A specific type of VC',
        purpose: 'We want a VC of this type',
        schema: [
          {
            uri: 'https://www.w3.org/2018/credentials/v1',
          },
          {
            uri: 'https://www.w3.org/2018/credentials/examples/v1',
          },
        ],
        constraints: {
          fields: [
            {
              path: ['$.type'],
              filter: {
                type: 'string',
                pattern: 'AlumniCredential',
              },
            },
          ],
        },
      },
    ],
  };
}
// path: ["$.type.*"],
function getPresentationDefinition_modified1(): PresentationDefinitionV1 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    input_descriptors: [
      {
        id: 'A specific type of VC',
        name: 'A specific type of VC',
        purpose: 'We want a VC of this type',
        schema: [
          {
            uri: 'https://www.w3.org/2018/credentials/v1',
          },
          {
            uri: 'https://www.w3.org/2018/credentials/examples/v1',
          },
        ],
        constraints: {
          fields: [
            {
              path: ['$.type.*'],
              filter: {
                type: 'string',
                pattern: 'AlumniCredential',
              },
            },
          ],
        },
      },
    ],
  };
}
// path: ["$.type[*]"],
function getPresentationDefinition_modified2(): PresentationDefinitionV1 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    input_descriptors: [
      {
        id: 'A specific type of VC',
        name: 'A specific type of VC',
        purpose: 'We want a VC of this type',
        schema: [
          {
            uri: 'https://www.w3.org/2018/credentials/v1',
          },
          {
            uri: 'https://www.w3.org/2018/credentials/examples/v1',
          },
        ],
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {
                type: 'string',
                pattern: 'AlumniCredential',
              },
            },
          ],
        },
      },
    ],
  };
}
// path: ["$.type.[*]"],
function getPresentationDefinition_modified3(): PresentationDefinitionV1 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    input_descriptors: [
      {
        id: 'A specific type of VC',
        name: 'A specific type of VC',
        purpose: 'We want a VC of this type',
        schema: [
          {
            uri: 'https://www.w3.org/2018/credentials/v1',
          },
          {
            uri: 'https://www.w3.org/2018/credentials/examples/v1',
          },
        ],
        constraints: {
          fields: [
            {
              path: ['$.type.[*]'],
              filter: {
                type: 'string',
                pattern: 'AlumniCredential',
              },
            },
          ],
        },
      },
    ],
  };
}
// path: ["$.type.[*]"],
function getPresentationDefinition_modified4(): PresentationDefinitionV1 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    input_descriptors: [
      {
        id: 'A specific type of VC',
        name: 'A specific type of VC',
        purpose: 'We want a VC of this type',
        schema: [
          {
            uri: 'https://www.w3.org/2018/credentials/v1',
          },
          {
            uri: 'https://www.w3.org/2018/credentials/examples/v1',
          },
        ],
        constraints: {
          fields: [
            {
              path: ['$.type'],
              filter: {
                type: 'array',
                pattern: 'AlumniCredential',
              },
            },
          ],
        },
      },
    ],
  };
}

function getPresentationDefinition_modified5(): PresentationDefinitionV1 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    input_descriptors: [
      {
        id: 'A specific type of VC',
        name: 'A specific type of VC',
        purpose: 'We want a VC of this type',
        schema: [
          {
            uri: 'https://www.w3.org/2018/credentials/v1',
          },
          {
            uri: 'https://www.w3.org/2018/credentials/examples/v1',
          },
        ],
        constraints: {
          fields: [
            {
              path: ['$.type'],
            },
          ],
        },
      },
    ],
  };
}

describe('evaluate niwim tests', () => {
  it('Evaluate case must return error', () => {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV1 = getPresentationDefinition_original();
    const vcs = getVerifiableCredentials();
    const selectResult = pex.evaluateCredentials(pdSchema, vcs);
    expect(selectResult.areRequiredCredentialsPresent).toBe(Status.ERROR);
  });

  it('Evaluate case must return success', () => {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV1 = getPresentationDefinition_modified1();
    const vcs = getVerifiableCredentials();
    const selectResult = pex.evaluateCredentials(pdSchema, vcs);
    expect(selectResult.areRequiredCredentialsPresent).toBe(Status.INFO);
  });

  it('Evaluate case must return success2', () => {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV1 = getPresentationDefinition_modified2();
    const vcs = getVerifiableCredentials();
    const selectResult = pex.evaluateCredentials(pdSchema, vcs);
    expect(selectResult.areRequiredCredentialsPresent).toBe(Status.INFO);
  });

  it('Evaluate case must return success3', () => {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV1 = getPresentationDefinition_modified3();
    const vcs = getVerifiableCredentials();

    expect(() => pex.evaluateCredentials(pdSchema, vcs)).toThrowError();
  });

  it('Evaluate case must return success4', () => {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV1 = getPresentationDefinition_modified4();
    const vcs = getVerifiableCredentials();
    const selectResult = pex.evaluateCredentials(pdSchema, vcs);
    expect(selectResult.areRequiredCredentialsPresent).toBe(Status.INFO);
  });

  // todo: This does not validate against v1 schema. From a first inspection it is indeed invalid
  xit('Evaluate case must return success5', () => {
    const pex: PEXv1 = new PEXv1();
    const pdSchema: PresentationDefinitionV1 = getPresentationDefinition_modified5();
    pdSchema.input_descriptors[0].constraints!.fields![0]!.predicate = 'required';
    pdSchema.input_descriptors[0].constraints!.fields![0]!.filter = {
      type: 'array',
      contains: {
        enum: ['AlumniCredential'],
      },
    } as unknown as FilterV1;
    const vcs = getVerifiableCredentials();
    const selectResult = pex.evaluateCredentials(pdSchema, vcs);
    expect(selectResult.areRequiredCredentialsPresent).toBe(Status.INFO);
  });
});
