import { W3CVerifiableCredential } from '@sphereon/ssi-types';

import { IPresentationDefinition, PEX, Status } from '../../lib';

describe('evaluate mattr tests', () => {
  it('should validate mattr presentation definition', () => {
    const validated = PEX.validateDefinition(pd);

    expect(validated).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('should pass with OpenBadgeCredential', () => {
    const pex: PEX = new PEX();
    const result = pex.evaluateCredentials(pd, vcs);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
  });

  it('should not pass when contains is not OpenBadgeCredential type', () => {
    const pex: PEX = new PEX();

    const newPd = {
      ...pd,
      input_descriptors: [
        {
          ...pd.input_descriptors[0],
          constraints: {
            ...pd.input_descriptors[0].constraints,
            fields: [
              {
                ...pd.input_descriptors[0].constraints.fields[0],
                filter: {
                  ...pd.input_descriptors[0].constraints.fields[0].filter,
                  contains: {
                    ...pd.input_descriptors[0].constraints.fields[0].filter.contains,
                    const: 'NotOpenBadgeCredential',
                  },
                },
              },
            ],
          },
        },
      ],
    };

    const result = pex.evaluateCredentials(newPd, vcs);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.ERROR);
  });

  const vcs: W3CVerifiableCredential[] = [
    {
      type: ['VerifiableCredential', 'VerifiableCredentialExtension', 'OpenBadgeCredential'],
      issuer: {
        id: 'did:web:launchpad.vii.electron.mattrlabs.io',
        name: 'Jobs for the Future (JFF)',
        iconUrl: 'https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/images/JFF_LogoLockup.png',
        image: 'https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/images/JFF_LogoLockup.png',
      },
      name: 'JFF x vc-edu PlugFest 2',
      description: "MATTR's submission for JFF Plugfest 2",
      credentialBranding: {
        backgroundColor: '#464c49',
      },
      issuanceDate: '2023-01-25T16:58:06.292Z',
      credentialSubject: {
        id: 'did:key:z6MkpGR4gs4Rc3Zph4vj8wRnjnAxgAPSxcR8MAVKutWspQzc',
        type: ['AchievementSubject'],
        achievement: {
          id: 'urn:uuid:bd6d9316-f7ae-4073-a1e5-2f7f5bd22922',
          name: 'JFF x vc-edu PlugFest 2 Interoperability',
          type: ['Achievement'],
          image: {
            id: 'https://w3c-ccg.github.io/vc-ed/plugfest-2-2022/images/JFF-VC-EDU-PLUGFEST2-badge-image.png',
            type: 'Image',
          },
          criteria: {
            type: 'Criteria',
            narrative:
              'Solutions providers earned this badge by demonstrating interoperability between multiple providers based on the OBv3 candidate final standard, with some additional required fields. Credential issuers earning this badge successfully issued a credential into at least two wallets.  Wallet implementers earning this badge successfully displayed credentials issued by at least two different credential issuers.',
          },
          description:
            'This credential solution supports the use of OBv3 and w3c Verifiable Credentials and is interoperable with at least two other solutions.  This was demonstrated successfully during JFF x vc-edu PlugFest 2.',
        },
      },
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        {
          '@vocab': 'https://w3id.org/security/undefinedTerm#',
        },
        'https://mattr.global/contexts/vc-extensions/v1',
        'https://purl.imsglobal.org/spec/ob/v3p0/context.json',
        'https://w3c-ccg.github.io/vc-status-rl-2020/contexts/vc-revocation-list-2020/v1.jsonld',
      ],
      credentialStatus: {
        id: 'https://launchpad.vii.electron.mattrlabs.io/core/v1/revocation-lists/b4aa46a0-5539-4a6b-aa03-8f6791c22ce3#49',
        type: 'RevocationList2020Status',
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2023-01-25T16:58:07Z',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..PrpRKt60yXOzMNiQY5bELX40F6Svwm-FyQ-Jv02VJDfTTH8GPPByjtOb_n3YfWidQVgySfGQ_H7VmCGjvsU6Aw',
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:web:launchpad.vii.electron.mattrlabs.io#6BhFMCGTJg',
      },
    },
  ];

  const pd = {
    id: '401f3844-e4f4-4031-897a-ca3e1f07d98b',
    input_descriptors: [
      {
        id: 'OpenBadgeCredential',
        format: { jwt_vc_json: { alg: ['EdDSA'] }, jwt_vc: { alg: ['EdDSA'] } },
        constraints: {
          fields: [
            {
              path: ['$.type'],
              filter: {
                type: 'array',
                items: { type: 'string' },
                contains: { const: 'OpenBadgeCredential' },
              },
            },
          ],
        },
      },
    ],
  } satisfies IPresentationDefinition;
});
