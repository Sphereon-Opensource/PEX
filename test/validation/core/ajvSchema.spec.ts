import Ajv from 'ajv';

describe('testing schemas with ajv', () => {
  it('test dummy schema should fail', () => {
    const ajv = new Ajv({ verbose: true, code: { source: true, lines: true, esm: false }, allowUnionTypes: true, allErrors: true, strict: false });

    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'integer' },
        bar: { type: 'string' },
      },
      required: ['foo'],
      additionalProperties: false,
    };

    const validate = ajv.compile(schema);

    const data = {
      foo: 1,
      bar: 'abc',
      baz: {
        a: 1,
        b: 2,
      },
    };

    const valid = validate(data);
    expect(valid).toBe(false);
  });

  it('test presentation definition v1 should fail', function () {
    const ajv = new Ajv({ verbose: true, code: { source: true, lines: true, esm: false }, allowUnionTypes: true, allErrors: true, strict: false });
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Presentation Definition',
      definitions: {
        schema: {
          type: 'object',
          properties: {
            uri: { type: 'string' },
            required: { type: 'boolean' },
          },
          required: ['uri'],
          additionalProperties: false,
        },
        filter: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            format: { type: 'string' },
            pattern: { type: 'string' },
            minimum: { type: ['number', 'string'] },
            minLength: { type: 'integer' },
            maxLength: { type: 'integer' },
            exclusiveMinimum: { type: ['number', 'string'] },
            exclusiveMaximum: { type: ['number', 'string'] },
            maximum: { type: ['number', 'string'] },
            const: { type: ['number', 'string'] },
            enum: {
              type: 'array',
              items: { type: ['number', 'string'] },
            },
            not: {
              type: 'object',
              minProperties: 1,
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        format: {
          type: 'object',
          patternProperties: {
            '^jwt$|^jwt_vc$|^jwt_vp$': {
              type: 'object',
              properties: {
                alg: {
                  type: 'array',
                  minItems: 1,
                  items: { type: 'string' },
                },
              },
              required: ['alg'],
              additionalProperties: false,
            },
            '^ldp_vc$|^ldp_vp$|^ldp$': {
              type: 'object',
              properties: {
                proof_type: {
                  type: 'array',
                  minItems: 1,
                  items: { type: 'string' },
                },
              },
              required: ['proof_type'],
              additionalProperties: false,
            },
            additionalProperties: false,
          },
          additionalProperties: false,
        },
        submission_requirements: {
          type: 'object',
          oneOf: [
            {
              properties: {
                name: { type: 'string' },
                purpose: { type: 'string' },
                rule: {
                  type: 'string',
                  enum: ['all', 'pick'],
                },
                count: { type: 'integer', minimum: 1 },
                min: { type: 'integer', minimum: 0 },
                max: { type: 'integer', minimum: 0 },
                from: { type: 'string' },
              },
              required: ['rule', 'from'],
              additionalProperties: false,
            },
            {
              properties: {
                name: { type: 'string' },
                purpose: { type: 'string' },
                rule: {
                  type: 'string',
                  enum: ['all', 'pick'],
                },
                count: { type: 'integer', minimum: 1 },
                min: { type: 'integer', minimum: 0 },
                max: { type: 'integer', minimum: 0 },
                from_nested: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    $ref: '#/definitions/submission_requirements',
                  },
                },
              },
              required: ['rule', 'from_nested'],
              additionalProperties: false,
            },
          ],
        },
        input_descriptors: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            purpose: { type: 'string' },
            group: {
              type: 'array',
              items: { type: 'string' },
            },
            schema: {
              type: 'array',
              items: { $ref: '#/definitions/schema' },
            },
            constraints: {
              type: 'object',
              properties: {
                limit_disclosure: {
                  type: 'string',
                  enum: ['required', 'preferred'],
                },
                statuses: {
                  type: 'object',
                  properties: {
                    active: {
                      type: 'object',
                      properties: {
                        directive: {
                          type: 'string',
                          enum: ['required', 'allowed', 'disallowed'],
                        },
                      },
                    },
                    suspended: {
                      type: 'object',
                      properties: {
                        directive: {
                          type: 'string',
                          enum: ['required', 'allowed', 'disallowed'],
                        },
                      },
                    },
                    revoked: {
                      type: 'object',
                      properties: {
                        directive: {
                          type: 'string',
                          enum: ['required', 'allowed', 'disallowed'],
                        },
                      },
                    },
                  },
                },
                fields: {
                  type: 'array',
                  items: { $ref: '#/definitions/field' },
                },
                subject_is_issuer: {
                  type: 'string',
                  enum: ['required', 'preferred'],
                },
                is_holder: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field_id: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                      directive: {
                        type: 'string',
                        enum: ['required', 'preferred'],
                      },
                    },
                    required: ['field_id', 'directive'],
                    additionalProperties: false,
                  },
                },
                same_subject: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field_id: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                      directive: {
                        type: 'string',
                        enum: ['required', 'preferred'],
                      },
                    },
                    required: ['field_id', 'directive'],
                    additionalProperties: false,
                  },
                },
              },
              additionalProperties: false,
            },
          },
          required: ['id', 'schema'],
          additionalProperties: false,
        },
        field: {
          type: 'object',
          oneOf: [
            {
              properties: {
                id: { type: 'string' },
                path: {
                  type: 'array',
                  items: { type: 'string' },
                },
                purpose: { type: 'string' },
                filter: { $ref: '#/definitions/filter' },
              },
              required: ['path'],
              additionalProperties: false,
            },
            {
              properties: {
                id: { type: 'string' },
                path: {
                  type: 'array',
                  items: { type: 'string' },
                },
                purpose: { type: 'string' },
                filter: { $ref: '#/definitions/filter' },
                predicate: {
                  type: 'string',
                  enum: ['required', 'preferred'],
                },
              },
              required: ['path', 'filter', 'predicate'],
              additionalProperties: false,
            },
          ],
        },
      },
      type: 'object',
      properties: {
        presentation_definition: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            purpose: { type: 'string' },
            format: { $ref: '#/definitions/format' },
            submission_requirements: {
              type: 'array',
              items: {
                $ref: '#/definitions/submission_requirements',
              },
            },
            input_descriptors: {
              type: 'array',
              items: { $ref: '#/definitions/input_descriptors' },
            },
          },
          required: ['id', 'input_descriptors'],
          additionalProperties: false,
        },
      },
    };
    const validate = ajv.compile(schema);
    const data = {
      presentation_definition: {
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
            schema: [{ uri: 'https://myschema.org' }],
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
      },
    };

    const valid = validate(data);
    expect(valid).toBe(false);

    // Remove the offending frame to double check it is now okay
    const { frame, ...rest } = { ...data.presentation_definition };
    const result = validate({ presentation_definition: { ...rest } });
    expect(result).toBe(true);
  });
});
