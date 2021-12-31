import { InternalPresentationDefinitionV1 } from '../../../lib/types/Internal.types';

export class PdMultiCredentials {
  getPresentationDefinition(): InternalPresentationDefinitionV1 {
    return {
      id: '31e2f0f1-6b70-411d-b239-56aed5321884',
      purpose: 'To sell you a drink we need to know that you are an adult.',
      input_descriptors: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          purpose: 'Your age should be greater or equal to 18.',
          schema: [
            {
              uri: 'https://www.w3.org/2018/credentials/v1',
            },
            {
              uri: 'https://www.w3.org/TR/vc-data-model/#types',
            },
          ],
          constraints: {
            same_subject: [
              {
                directive: 'required',
                field_id: ['age', 'citizenship', 'abbr', 'birthPlace'],
              },
            ],
            limit_disclosure: 'required',
            fields: [
              {
                id: 'age',
                path: ['$.credentialSubject.age', '$.credentialSubject.details.age'],
                filter: {
                  type: 'number',
                  minimum: 18,
                },
                predicate: 'required',
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc7',
          purpose: 'Your age should be greater or equal to 18.',
          schema: [
            {
              uri: 'https://www.w3.org/2018/credentials/v1',
            },
            {
              uri: 'https://www.w3.org/TR/vc-data-model/#types',
            },
          ],
          constraints: {
            limit_disclosure: 'required',
            fields: [
              {
                id: 'citizenship',
                path: ['$.credentialSubject.citizenship[*]', '$.credentialSubject.details.citizenship[*]'],
                filter: {
                  type: 'string',
                  pattern: 'eu|us|uk',
                },
                predicate: 'required',
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc6',
          purpose: 'Your age should be greater or equal to 18.',
          schema: [
            {
              uri: 'https://www.w3.org/2018/credentials/v1',
            },
            {
              uri: 'https://www.w3.org/TR/vc-data-model/#types',
            },
          ],
          constraints: {
            limit_disclosure: 'required',
            fields: [
              {
                id: 'abbr',
                path: ['$.credentialSubject.country[*].abbr', '$.credentialSubject.details.country[*].abbr'],
                filter: {
                  type: 'string',
                  pattern: 'NLD',
                },
                predicate: 'required',
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc5',
          purpose: 'Your age should be greater or equal to 18.',
          schema: [
            {
              uri: 'https://www.w3.org/2018/credentials/v1',
            },
            {
              uri: 'https://www.w3.org/TR/vc-data-model/#types',
            },
          ],
          constraints: {
            limit_disclosure: 'required',
            fields: [
              {
                id: 'birthPlace',
                path: ['$.credentialSubject.birthPlace'],
                filter: {
                  type: 'string',
                  pattern: 'Maarssen',
                },
                predicate: 'required',
              },
            ],
          },
        },
      ],
    } as InternalPresentationDefinitionV1;
  }
}
