import { IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types';

export class SrRules {
  public getVerifiablePresentation(): Partial<IVerifiablePresentation> {
    return {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://identity.foundation/presentation-exchange/submission/v1'],
      presentation_submission: {
        id: 'accd5adf-1dbf-4ed9-9ba2-d687476126cb',
        definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
        descriptor_map: [
          {
            id: '867bfe7a-5b91-46b2-9ba4-70028b8d9aaa',
            format: 'ldp_vp',
            path: '$.verifiableCredential[0]',
          },
          {
            id: '867bfe7a-5b91-46b2-9ba4-70028b8d9bbb',
            format: 'ldp_vp',
            path: '$.verifiableCredential[1]',
          },
          {
            id: '867bfe7a-5b91-46b2-9ba4-70028b8d9ccc',
            format: 'ldp_vp',
            path: '$.verifiableCredential[2]',
          },
          {
            id: '867bfe7a-5b91-46b2-9ba4-70028b8d9ddd',
            format: 'ldp_vp',
            path: '$.verifiableCredential[3]',
          },
        ],
      },
      type: ['VerifiablePresentation', 'PresentationSubmission'],
      verifiableCredential: [
        {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          credentialSchema: [
            {
              id: 'https://www.w3.org/TR/vc-data-model/#types',
            },
          ],
          credentialSubject: {
            id: 'VCSubject2020081200',
            field1Key: 'field1Value',
          },
          id: '867bfe7a-5b91-46b2-aaaa-70028b8d9aaa',
          issuer: 'VC1Issuer',
          type: ['VerifiableCredential'],
          issuanceDate: '2010-11-08T19:73:24Z',
          proof: {
            jws: '',
            type: 'Ed25519Signature2020',
            created: '2021-11-08T19:18:08Z',
            verificationMethod: 'did:key:2021110800',
            proofPurpose: 'assertionMethod',
            proofValue: 'proofValue2021110801',
          },
        } as unknown as IVerifiableCredential,
        {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          credentialSchema: [
            {
              id: 'https://www.w3.org/TR/vc-data-model/#types',
            },
          ],
          credentialSubject: {
            id: 'VCSubject2020081200',
            field2Key: 'field2Value',
          },
          id: '867bfe7a-5b91-46b2-bbbb-70028b8d9bbb',
          issuer: 'VC2Issuer',
          type: ['VerifiableCredential'],
          issuanceDate: '2010-11-08T19:73:24Z',
          proof: {
            jws: '',
            type: 'Ed25519Signature2020',
            created: '2021-11-08T19:18:08Z',
            verificationMethod: 'did:key:2021110800',
            proofPurpose: 'assertionMethod',
            proofValue: 'proofValue2021110801',
          },
        } as unknown as IVerifiableCredential,
        {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          credentialSchema: [
            {
              id: 'https://www.w3.org/TR/vc-data-model/#types',
            },
          ],
          credentialSubject: {
            id: 'VCSubject2020081205',
            field3Key: 'field3Value',
          },
          id: '867bfe7a-5b91-46b2-cccc-70028b8d9ccc',
          issuer: 'VC3Issuer',
          type: ['VerifiableCredential'],
          issuanceDate: '2010-11-08T19:73:01Z',
          proof: {
            jws: '',
            type: 'Ed25519Signature2020',
            created: '2021-11-08T19:18:08Z',
            verificationMethod: 'did:key:2021110800',
            proofPurpose: 'assertionMethod',
            proofValue: 'proofValue2021110801',
          },
        } as IVerifiableCredential,
        {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          credentialSchema: [
            {
              id: 'https://www.w3.org/TR/vc-data-model/#types',
            },
          ],
          credentialSubject: {
            id: 'VCSubject2020081205',
            field4Key: 'field4Value',
          },
          id: '867bfe7a-5b91-46b2-dddd-70028b8d9ddd',
          issuer: 'VC4Issuer',
          type: ['VerifiableCredential'],
          issuanceDate: '2010-11-08T19:73:02Z',
          proof: {
            jws: '',
            type: 'Ed25519Signature2020',
            created: '2021-11-08T19:18:08Z',
            verificationMethod: 'did:key:2021110803',
            proofPurpose: 'assertionMethod',
            proofValue: 'proofValue2021110804',
          },
        } as IVerifiableCredential,
      ],
    };
  }
}
