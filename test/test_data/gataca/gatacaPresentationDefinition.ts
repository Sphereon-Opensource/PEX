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
}
