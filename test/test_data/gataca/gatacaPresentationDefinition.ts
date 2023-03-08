import { PresentationDefinitionV1 } from '@sphereon/pex-models';

export class GatacaPresentationDefinition {
  static getPresentationDefinition(): PresentationDefinitionV1 {
    return {
      id: 'AxuMrbLyT1o88VcpzeBiXLT8Jtm6kYzvKksNEj6XWZPq',
      input_descriptors: [
        {
          constraints: {
            fields: [
              {
                filter: {
                  pattern: 'emailCredential',
                  type: 'string',
                },
                path: ['$.type[(@.length-1)]'],
                purpose: 'Client authentication',
              },
            ],
          },
          group: ['mandatory'],
          id: 'emailCredential',
          purpose: 'Client authentication',
          schema: [
            {
              uri: 'https://www.w3.org/2018/credentials/v1',
            },
          ],
        },
        {
          constraints: {
            fields: [
              {
                filter: {
                  pattern: 'phoneCredential',
                  type: 'string',
                },
                path: ['$.type[(@.length-1)]'],
                purpose: 'Client authentication',
              },
            ],
          },
          group: ['optional'],
          id: 'phoneCredential',
          purpose: 'Client authentication',
          schema: [
            {
              uri: 'https://www.w3.org/2018/credentials/v1',
            },
          ],
        },
        {
          constraints: {
            fields: [
              {
                filter: {
                  pattern: 'transcriptOfRecordsCredential',
                  type: 'string',
                },
                path: ['$.type[(@.length-1)]'],
                purpose: 'Special clients promotion',
              },
            ],
          },
          group: ['optional'],
          id: 'transcriptOfRecordsCredential',
          purpose: 'Special clients promotion',
          schema: [
            {
              uri: 'https://www.w3.org/2018/credentials/v1',
            },
          ],
        },
      ],
      name: 'Gataca',
      purpose: 'Bank Of America Demo',
      submission_requirements: [
        {
          from: 'mandatory',
          name: 'Mandatory data',
          purpose: 'Basic data to provide the service',
          rule: 'all',
        },
        {
          from: 'optional',
          name: 'Optional data',
          purpose: 'Additional data to enrich the service',
          rule: 'pick',
        },
      ],
    } as PresentationDefinitionV1;
  }

  static getPresentationDefinition1(): PresentationDefinitionV1 {
    return {
      name: 'Gataca',
      id: 'CAajN2Z9z2pDW5jYfLdN5iemXutsK5mYDXE8porx79f',
      purpose: 'Bank Fake Demo',
      format: {
        ldp: {
          proof_type: ['JsonWebSignature2020', 'Ed25519Signature2018', 'EcdsaSecp256k1Signature2019', 'RsaSignature2018'],
        },
        ldp_vp: {
          proof_type: ['JsonWebSignature2020', 'Ed25519Signature2018', 'EcdsaSecp256k1Signature2019', 'RsaSignature2018'],
        },
      },
      submission_requirements: [
        {
          name: 'Mandatory data',
          purpose: 'Basic data to provide the service',
          rule: 'all',
          from: 'mandatory',
        },
        {
          name: 'Optional data',
          purpose: 'Additional data to enrich the service',
          rule: 'pick',
          min: 0,
          from: 'optional',
        },
      ],
      input_descriptors: [
        {
          id: 'emailCredential',
          name: 'emailCredential',
          purpose: 'Client authentication',
          group: ['mandatory'],
          schema: [
            {
              uri: 'https://www.w3.org/2018/credentials/v1',
            },
          ],
          constraints: {
            fields: [
              {
                path: ['$.type[-1:]'],
                purpose: 'The claim must be of a specific type',
                filter: {
                  type: 'string',
                  pattern: 'emailCredential',
                },
              },
              {
                path: ['$.issuer', '$.vc.issuer', '$.iss'],
                purpose: 'Assert the trust of the issuer',
                filter: {
                  type: 'string',
                  pattern: '(did:gatc:24gsRbsURij3edoveHv81jt9EnhggrnR)',
                },
              },
            ],
          },
        },
        {
          id: 'phoneCredential',
          name: 'phoneCredential',
          purpose: 'Client authentication',
          group: ['optional'],
          schema: [
            {
              uri: 'https://www.w3.org/2018/credentials/v1',
            },
          ],
          constraints: {
            fields: [
              {
                path: ['$.type[-1:]'],
                purpose: 'The claim must be of a specific type',
                filter: {
                  type: 'string',
                  pattern: 'phoneCredential',
                },
              },
            ],
          },
        },
        {
          id: 'transcriptOfRecordsCredential',
          name: 'transcriptOfRecordsCredential',
          purpose: 'Special clients promotion',
          group: ['optional'],
          schema: [
            {
              uri: 'https://www.w3.org/2018/credentials/v1',
            },
          ],
          constraints: {
            fields: [
              {
                path: ['$.type[-1:]'],
                purpose: 'The claim must be of a specific type',
                filter: {
                  type: 'string',
                  pattern: 'transcriptOfRecordsCredential',
                },
              },
            ],
          },
        },
      ],
    };
  }
}
