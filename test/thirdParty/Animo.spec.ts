import { W3CVerifiableCredential } from '@sphereon/ssi-types';

import { IPresentationDefinition, PEX } from '../../lib';

describe('evaluate animo tests', () => {
  it('should pass with 2 VCs and 2 IDs', () => {
    const pex: PEX = new PEX();
    const result = pex.evaluateCredentials(pd, vcs);
    console.log(JSON.stringify(result, null, 2));
  });

  it('should not pass with 2 VCs and 3 IDs', () => {
    const pex: PEX = new PEX();
    const pdModified = pd;
    pdModified.input_descriptors.push({
      id: 'jf2yccf9-becb-nf4e-0f6d-bvbe152a7fd9',
      purpose: 'You must have a valid Bachelor Degree issued by Sphereon.',
      schema: [
        {
          uri: 'https://www.w3.org/2018/credentials/v1',
        },
      ],
      constraints: {
        fields: [
          {
            path: ['$.issuer', '$.vc.issuer', '$.iss'],
            filter: {
              type: 'string',
              pattern: 'did:web:sphereon',
            },
          },
        ],
      },
    });
    const result = pex.evaluateCredentials(pdModified, vcs);
    console.log(JSON.stringify(result, null, 2));
  });
  const vcs: W3CVerifiableCredential[] = [
    {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
      id: 'http://example.gov/credentials/3732',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      issuer: 'did:web:vc.transmute.world',
      issuanceDate: '2020-03-16T22:37:26.544Z',
      credentialSubject: {
        id: 'did:key:z6MkjRagNiMu91DduvCvgEsqLZDVzrJzFrwahc4tXLt9DoHd',
        degree: {
          type: 'BachelorDegree',
          name: 'Bachelor of Science and Arts',
        },
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2020-04-02T18:28:08Z',
        verificationMethod: 'did:web:vc.transmute.world#z6MksHh7qHWvybLg5QTPPdG2DgEjjduBDArV9EF9mRiRzMBN',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YtqjEYnFENT7fNW-COD0HAACxeuQxPKAmp4nIl8jYAu__6IH2FpSxv81w-l5PvE1og50tS9tH8WyXMlXyo45CA',
      },
    },
    {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v2'],
      id: 'http://example.gov/credentials/1231231',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      issuer: 'did:web:animo.id',
      issuanceDate: '2020-03-16T22:37:26.544Z',
      credentialSubject: {
        id: 'did:key:z6MkjRagNiMu91DduvCvgEsqLZDVzrJzFrwahc4tXLt9DoHd',
        degree: {
          type: 'BachelorDegree',
          name: 'Bachelor of Fights',
        },
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2020-04-02T18:28:08Z',
        verificationMethod: 'did:web:animo.id#z6MksHh7qHWvybLg5QTPPdG2DgEjjduBDArV9EF9mRiRzMBN',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YtqjEYnFENT7fNW-COD0HAACxeuQxPKAmp4nIl8jYAu__6IH2FpSxv81w-l5PvE1og50tS9tH8WyXMlXyo45CA',
      },
    },
  ];
  const pd: IPresentationDefinition = {
    id: '31e2f0f1-6b70-411d-b239-56aed5321884',
    purpose: 'To check if you have a valid college degree.',
    input_descriptors: [
      {
        id: 'df2accf9-1ecb-4f4e-af6d-21be152a881b',
        purpose: 'You must have a valid Bachelor Degree issued by Animo.',
        schema: [
          {
            uri: 'https://www.w3.org/2018/credentials/v1',
          },
        ],
        constraints: {
          fields: [
            {
              path: ['$.issuer', '$.vc.issuer', '$.iss'],
              filter: {
                type: 'string',
                pattern: 'did:web:animo.id',
              },
            },
          ],
        },
      },
      {
        id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
        purpose: 'You must have a valid Bachelor Degree issued by Transmute.',
        schema: [
          {
            uri: 'https://www.w3.org/2018/credentials/v1',
          },
        ],
        constraints: {
          fields: [
            {
              path: ['$.issuer', '$.vc.issuer', '$.iss'],
              filter: {
                type: 'string',
                pattern: 'did:web:vc.transmute.world',
              },
            },
          ],
        },
      },
    ],
  };
});
