import { VerifiableCredential } from '../../../lib';

export class VcMultiCredentials {
  getVerifiableCredentials(): VerifiableCredential[] {
    return [
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        credentialSchema: [
          {
            id: 'https://www.w3.org/TR/vc-data-model/#types',
          },
        ],
        credentialSubject: {
          id: 'VCSubject2020081200',
          age: 19,
        },
        id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
        issuer: '',
        issuanceDate: '',
        type: ['VerifiableCredential'],
        proof: {
          type: 'RsaSignature2018',
          created: '2017-06-18T21:19:10Z',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'https://example.edu/issuers/keys/1',
          jws: '...',
        },
      },
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        credentialSchema: [
          {
            id: 'https://www.w3.org/TR/vc-data-model/#types',
          },
        ],
        credentialSubject: {
          id: 'VCSubject2020081200',
          details: {
            citizenship: ['eu'],
          },
        },
        id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
        issuer: '',
        issuanceDate: '',
        type: ['VerifiableCredential'],
        proof: {
          type: 'RsaSignature2018',
          created: '2017-06-18T21:19:10Z',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'https://example.edu/issuers/keys/1',
          jws: '...',
        },
      },
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        credentialSchema: [
          {
            id: 'https://www.w3.org/TR/vc-data-model/#types',
          },
        ],
        credentialSubject: {
          id: 'VCSubject2020081200',
          country: [
            {
              abbr: 'NLD',
            },
          ],
        },
        id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
        issuer: '',
        issuanceDate: '',
        type: ['VerifiableCredential'],
        proof: {
          type: 'RsaSignature2018',
          created: '2017-06-18T21:19:10Z',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'https://example.edu/issuers/keys/1',
          jws: '...',
        },
      },
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        credentialSchema: [
          {
            id: 'https://www.w3.org/TR/vc-data-model/#types',
          },
        ],
        credentialSubject: {
          id: 'VCSubject2020081200',
          birthPlace: 'Maarssen',
        },
        id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
        issuanceDate: '',
        issuer: '',
        type: ['VerifiableCredential'],
        proof: {
          type: 'RsaSignature2018',
          created: '2017-06-18T21:19:10Z',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'https://example.edu/issuers/keys/1',
          jws: '...',
        },
      },
    ];
  }
}
