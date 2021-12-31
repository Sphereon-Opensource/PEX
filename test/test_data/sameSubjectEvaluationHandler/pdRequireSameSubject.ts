import { InternalPresentationDefinitionV1 } from '../../../lib/types/Internal.types';

export class PdRequireSameSubject {
  public getPresentationDefinition(): InternalPresentationDefinitionV1 {
    return {
      id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      input_descriptors: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9aaa',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field1Key',
                path: ['$.field1Key'],
              },
            ],
            same_subject: [
              {
                directive: 'required',
                field_id: ['field1Key', 'field2Key'],
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9bbb',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field2Key',
                path: ['$.field2Key'],
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9ccc',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field3Key',
                path: ['$.field3Key'],
              },
            ],
            same_subject: [
              {
                directive: 'preferred',
                field_id: ['field3Key', 'field4Key'],
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9ddd',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field4Key',
                path: ['$.field4Key'],
              },
            ],
          },
        },

        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9eee',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field5Key',
                path: ['$.field5Key'],
              },
            ],
            same_subject: [
              {
                directive: 'required',
                field_id: ['field5Key', 'field6Key'],
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9fff',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field6Key',
                path: ['$.field6Key'],
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9ggg',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field7Key',
                path: ['$.field7Key'],
              },
            ],
            same_subject: [
              {
                directive: 'preferred',
                field_id: ['field7Key', 'field8Key'],
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9hhh',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field8Key',
                path: ['$.field8Key'],
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9iii',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field9Key',
                path: ['$.field9Key'],
              },
            ],
            same_subject: [
              {
                directive: 'preferred',
                field_id: ['field9Key', 'field10Key'],
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9jjj',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field10Key',
                path: ['$.field10Key'],
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9kkk',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field11Key',
                path: ['$.field11Key'],
              },
            ],
            same_subject: [
              {
                directive: 'required',
                field_id: ['field11Key', 'field12Key'],
              },
            ],
          },
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9lll',
          schema: [
            {
              uri: 'https://some-schemas.org/1.0.0/some.json',
            },
          ],
          constraints: {
            fields: [
              {
                id: 'field12Key',
                path: ['$.field12Key'],
              },
            ],
          },
        },
      ],
    } as InternalPresentationDefinitionV1;
  }
}
