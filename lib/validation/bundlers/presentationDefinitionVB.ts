import { Format, JwtObject, LdpObject, PresentationDefinition, SubmissionRequirement } from '@sphereon/pe-models';
import Ajv from 'ajv';

import { Validation, ValidationPredicate } from '../core';

import { InputDescriptorsVB } from './inputDescriptorsVB';
import { SubmissionRequirementVB } from './submissionRequirementVB';
import { ValidationBundler } from './validationBundler';

export class PresentationDefinitionVB extends ValidationBundler<PresentationDefinition> {
  private ajv: Ajv;

  constructor(parentTag: string) {
    super(parentTag, 'presentation_definition');
    this.ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  }

  public getValidations(pd: PresentationDefinition): Validation<unknown>[] {
    return [
      ...this.myValidations(pd),
      ...new InputDescriptorsVB(this.myTag).getValidations(pd.input_descriptors),
      ...new SubmissionRequirementVB(this.myTag).getValidations(pd.submission_requirements),
    ];
  }

  private myValidations(pd: PresentationDefinition): Validation<unknown>[] {
    return [
      // E Section 4.B   : The Input Descriptors (#term:input-descriptors) required for submission are described by the submission_requirements. If no submission_requirements value is present, all inputs listed in the input_descriptors array are required for submission.
      {
        tag: this.getTag(),
        target: pd,
        predicate: (pd) => pd != null,
        message: 'presentation_definition should be non null.',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate: this.shouldBeAsPerJsonSchema(),
        message: 'presentation_definition should be as per json schema.',
      },
      {
        tag: this.getTag(),
        target: pd?.id,
        predicate: PresentationDefinitionVB.nonEmptyString,
        message: 'id should not be empty',
      },
      {
        tag: this.getTag(),
        target: pd?.name,
        predicate: PresentationDefinitionVB.optionalNonEmptyString,
        message: 'name should be a non-empty string',
      },
      {
        tag: this.getTag(),
        target: pd?.purpose,
        predicate: PresentationDefinitionVB.optionalNonEmptyString,
        message: 'purpose should be a non-empty string',
      },
      {
        tag: this.getTag(),
        target: pd?.format,
        predicate: PresentationDefinitionVB.formatValuesShouldNotBeEmpty,
        message: 'formats values should not empty',
      },
      {
        tag: this.getTag(),
        target: pd?.format,
        predicate: PresentationDefinitionVB.formatValuesShouldBeAmongKnownValues,
        message: 'formats should only have known identifiers for alg or proof_type',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate: PresentationDefinitionVB.groupShouldMatchSubmissionRequirements,
        message: 'input descriptor group should match the from in submission requirements.',
      },
    ];
  }

  private static optionalNonEmptyString(str: string): boolean {
    // TODO extract to generic utils or use something like lodash
    return str == null || str.length > 0;
  }

  private static nonEmptyString(id: string): boolean {
    // TODO extract to generic utils or use something like lodash
    return id != null && id.length > 0;
  }

  private static formatValuesShouldNotBeEmpty(format: Format): boolean {
    let areExpectedValuesPresent = true;

    if (format?.jwt != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.jwt.alg?.length > 0;
    }
    if (format?.jwt_vc != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.jwt_vc.alg?.length > 0;
    }
    if (format?.jwt_vp != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.jwt_vp.alg?.length > 0;
    }
    if (format?.ldp != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.ldp.proof_type?.length > 0;
    }
    if (format?.ldp_vc != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.ldp_vc.proof_type?.length > 0;
    }
    if (format?.ldp_vp != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.ldp_vp.proof_type?.length > 0;
    }

    return areExpectedValuesPresent;
  }

  private static formatValuesShouldBeAmongKnownValues(format: Format): boolean {
    let unknownProofsAndAlgorithms: string[] = [];

    if (format != null) {
      const jwtAlgos: string[] = [
        'HS256',
        'HS384',
        'HS512',
        'RS256',
        'RS384',
        'RS512',
        'ES256',
        'ES384',
        'ES512',
        'PS256',
        'PS384',
        'PS512',
        'none',
        'RSA1_5',
        'RSA-OAEP',
        'RSA-OAEP-256',
        'A128KW',
        'A192KW',
        'A256KW',
        'dir',
        'ECDH-ES',
        'ECDH-ES+A128KW',
        'ECDH-ES+A192KW',
        'ECDH-ES+A256KW',
        'A128GCMKW',
        'A192GCMKW',
        'A256GCMKW',
        'PBES2-HS256+A128KW',
        'PBES2-HS384+A192KW',
        'PBES2-HS512+A256KW',
      ];
      const ldpTypes: string[] = [
        'Ed25519Signature2018',
        'RsaSignature2018',
        'EcdsaSecp256k1Signature2019',
        'EcdsaSecp256k1RecoverySignature2020',
        'JsonWebSignature2020',
        'GpgSignature2020',
        'JcsEd25519Signature2020',
        'BbsBlsSignature2020',
        'Bls12381G2Key2020',
      ];

      unknownProofsAndAlgorithms = [
        ...PresentationDefinitionVB.isJWTAlgoKnown(format.jwt, jwtAlgos),
        ...PresentationDefinitionVB.isJWTAlgoKnown(format.jwt_vc, jwtAlgos),
        ...PresentationDefinitionVB.isJWTAlgoKnown(format.jwt_vp, jwtAlgos),

        ...PresentationDefinitionVB.isLDPProofKnown(format.ldp, ldpTypes),
        ...PresentationDefinitionVB.isLDPProofKnown(format.ldp_vc, ldpTypes),
        ...PresentationDefinitionVB.isLDPProofKnown(format.ldp_vp, ldpTypes),
      ];
    }
    return unknownProofsAndAlgorithms.length === 0;
  }

  private static isJWTAlgoKnown(jwtObject: JwtObject, jwtAlgos: string[]): string[] {
    const unknownAlgorithms: string[] = [];
    if (jwtObject != null && jwtObject.alg != null) {
      for (const jwtAlgo of jwtObject.alg) {
        if (!jwtAlgos.includes(jwtAlgo)) {
          unknownAlgorithms.push(jwtAlgo);
        }
      }
    }
    return unknownAlgorithms;
  }

  private static isLDPProofKnown(ldpObject: LdpObject, ldpTypes: string[]): string[] {
    const unknownProofType: string[] = [];
    if (ldpObject != null && ldpObject.proof_type != null) {
      for (const ldpProof of ldpObject.proof_type) {
        if (!ldpTypes.includes(ldpProof)) {
          unknownProofType.push(ldpProof);
        }
      }
    }
    return unknownProofType;
  }

  private static groupShouldMatchSubmissionRequirements(pd: PresentationDefinition): boolean {
    if (pd.submission_requirements != null && pd.submission_requirements.length > 0) {
      const groups = pd.input_descriptors
        .map((inDesc) => inDesc?.group)
        .filter((groups, index) => groups != null && groups[index] != null)
        .map((groups, index) => groups[index]);
      const groupStrings: Set<string> = new Set<string>(groups);

      const fromValues = PresentationDefinitionVB.flatten(pd.submission_requirements)
        .map((srs) => srs?.from)
        .filter((fromValues, index) => fromValues != null && fromValues[index] != null)
        .map((fromValues, index) => fromValues[index]);

      const fromValueStrings: Set<string> = new Set<string>(fromValues);

      const difference = new Set(
        [...fromValueStrings].filter((x) => x != null && x.length > 0 && !groupStrings.has(x))
      );

      return difference.size === 0;
    }

    return true;
  }

  private static flatten(srs: SubmissionRequirement[]) {
    return srs?.reduce(
      (accumulator, submissionRequirement) =>
        accumulator.concat(
          Array.isArray(submissionRequirement.from_nested)
            ? this.flatten(submissionRequirement.from_nested as SubmissionRequirement[])
            : submissionRequirement
        ),
      []
    );
  }

  private shouldBeAsPerJsonSchema(): ValidationPredicate<unknown> {
    // TODO can be be extracted as a generic function
    return (presentationDefinition: PresentationDefinition): boolean => {
      const presentationDefinitionSchema = PresentationDefinitionVB.getPresentationDefinitionSchema();

      const validate = this.ajv.compile(presentationDefinitionSchema);
      const valid = validate(presentationDefinition);

      if (!valid) {
        //console.log(validate.errors);
      }

      return valid;
    };
  }

  //TODO: pass it with a config file
  private static getPresentationDefinitionSchema() {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Presentation Definition',
      definitions: {
        schema: {
          type: 'object',
          properties: {
            uri: {
              type: 'string',
            },
            required: {
              type: 'boolean',
            },
          },
          required: ['uri'],
          additionalProperties: false,
        },
        filter: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
            },
            format: {
              type: 'string',
            },
            pattern: {
              type: 'string',
            },
            minimum: {
              type: ['number', 'string'],
            },
            minLength: {
              type: 'integer',
            },
            maxLength: {
              type: 'integer',
            },
            exclusiveMinimum: {
              type: ['number', 'string'],
            },
            exclusiveMaximum: {
              type: ['number', 'string'],
            },
            maximum: {
              type: ['number', 'string'],
            },
            const: {
              type: ['number', 'string'],
            },
            enum: {
              type: 'array',
              items: {
                type: ['number', 'string'],
              },
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
                  items: {
                    type: 'string',
                  },
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
                  items: {
                    type: 'string',
                  },
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
                name: {
                  type: 'string',
                },
                purpose: {
                  type: 'string',
                },
                rule: {
                  type: 'string',
                  enum: ['all', 'pick'],
                },
                count: {
                  type: 'integer',
                  minimum: 1,
                },
                min: {
                  type: 'integer',
                  minimum: 0,
                },
                max: {
                  type: 'integer',
                  minimum: 0,
                },
                from: {
                  type: 'string',
                },
              },
              required: ['rule', 'from'],
              additionalProperties: false,
            },
            {
              properties: {
                name: {
                  type: 'string',
                },
                purpose: {
                  type: 'string',
                },
                rule: {
                  type: 'string',
                  enum: ['all', 'pick'],
                },
                count: {
                  type: 'integer',
                  minimum: 1,
                },
                min: {
                  type: 'integer',
                  minimum: 0,
                },
                max: {
                  type: 'integer',
                  minimum: 0,
                },
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
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            purpose: {
              type: 'string',
            },
            group: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            schema: {
              type: 'array',
              items: {
                $ref: '#/definitions/schema',
              },
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
                  items: {
                    $ref: '#/definitions/field',
                  },
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
                        items: {
                          type: 'string',
                        },
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
                        items: {
                          type: 'string',
                        },
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
                id: {
                  type: 'string',
                },
                path: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
                purpose: {
                  type: 'string',
                },
                filter: {
                  $ref: '#/definitions/filter',
                },
              },
              required: ['path'],
              additionalProperties: false,
            },
            {
              properties: {
                id: {
                  type: 'string',
                },
                path: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
                purpose: {
                  type: 'string',
                },
                filter: {
                  $ref: '#/definitions/filter',
                },
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
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            purpose: {
              type: 'string',
            },
            format: {
              $ref: '#/definitions/format',
            },
            submission_requirements: {
              type: 'array',
              items: {
                $ref: '#/definitions/submission_requirements',
              },
            },
            input_descriptors: {
              type: 'array',
              items: {
                $ref: '#/definitions/input_descriptors',
              },
            },
          },
          required: ['id', 'input_descriptors'],
          additionalProperties: false,
        },
      },
    };
  }
}
