import { URL } from 'url';

import { InputDescriptor, Schema } from '@sphereon/pe-models';
import Ajv from 'ajv';
import jp from 'jsonpath';

import { Validation, ValidationPredicate } from '../core';

import { ConstraintsVB } from './constraintsVB';
import { ValidationBundler } from './validationBundler';

export class InputDescriptorsVB extends ValidationBundler<InputDescriptor[]> {
  private readonly idMustBeNonEmptyStringMsg = 'input descriptor id must be non-empty string';
  private readonly nameShouldBeNonEmptyStringMsg = 'input descriptor name should be non-empty string';
  private readonly purposeShouldBeNonEmptyStringMsg = 'input descriptor purpose should be non-empty string';
  private readonly idMustBeUniqueMsg = 'input descriptor id must be unique';
  private readonly fieldsIdMustBeUniqueMsg = 'fields id must be unique';
  private readonly shouldHaveValidSchemaURIMsg = 'schema should have valid URI';

  constructor(parentTag: string) {
    super(parentTag, 'input_descriptor');
  }

  public getValidations(inputDescriptors: InputDescriptor[]): Validation<unknown>[] {
    let validations: Validation<unknown>[] = [];

    inputDescriptors.forEach((inputDescriptor, inDescInd) => {
      validations = [...validations, ...this.getValidationFor(inputDescriptor, inDescInd)];
    });

    validations = [
      ...validations,
      this.shouldHaveUniqueIds(inputDescriptors),
      this.shouldHaveUniqueFieldsIds(inputDescriptors),
    ];

    return validations;
  }

  private getValidationFor(inputDescriptor: InputDescriptor, inDescInd: number): Validation<unknown>[] {
    return [
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor?.id,
        predicate: InputDescriptorsVB.nonEmptyString,
        message: this.idMustBeNonEmptyStringMsg,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor?.schema,
        predicate: this.isValidSchema(),
        message: this.shouldHaveValidSchemaURIMsg,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor?.name,
        predicate: InputDescriptorsVB.optionalNonEmptyString,
        message: this.nameShouldBeNonEmptyStringMsg,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor?.purpose,
        predicate: InputDescriptorsVB.optionalNonEmptyString,
        message: this.purposeShouldBeNonEmptyStringMsg,
      },
      ...this.constraintsValidations(inputDescriptor, inDescInd),
    ];
  }

  protected getMyTag(srInd: number) {
    // TODO extract to make it generic
    return this.parentTag + '.' + this.myTag + '[' + srInd + ']';
  }

  private static nonEmptyString(id: string): boolean {
    // TODO extract to generic utils or use something like lodash
    return id != null && id.length > 0;
  }

  private static optionalNonEmptyString(name: string): boolean {
    // TODO extract to generic utils or use something like lodash
    return name == null || name.length > 0;
  }

  public evaluateCandidates(inputDescriptors: InputDescriptor[], inputCandidates: string) {
    const matchingCandidates = [];
    for (let inputCandidate of jp.query(inputCandidates, '$.verifiableCredential[*]')) {
      for (let inputDescriptor of inputDescriptors) {
        let evaluation = this.evaluateInput(inputDescriptor, inputCandidate);
        if (evaluation !== undefined) {
          matchingCandidates.push(evaluation);
        }
      }
    }
    return matchingCandidates;
  }

  public evaluateInput(inputDescriptor: InputDescriptor, inputCandidate: string): any {
    if (inputDescriptor.constraints) {
      for (const field of inputDescriptor.constraints.fields) {
        for (const path of field.path) {
          const result = jp.query(inputCandidate, path);
          if (result.length) {
            if (field.filter) {
              const candidate = this.searchProperty(inputCandidate, result[0]);
              const schema = {
                type: 'object',
                properties: {
                  [candidate.key]: {
                    ...field.filter
                  }
                }
              }
              const ajv = new Ajv();
              const validate = ajv.compile(schema);
              const valid = validate(inputCandidate);
              if (field.predicate) {
                return valid;
              } else {
                if (!valid) {
                  return valid.toString();
                }
              }
            }
            return result[0];
          }
        }
      }
    }
  }

  private searchProperty (obj, query) {
    for (let key in obj) {
        var value = obj[key];

        if (typeof value === 'object') {
          const result = this.searchProperty(value, query);
          if (result) {
            return result;
          }
        }

        if (value === query) {
            return { 'key': key, 'value': value };
        }
      }
    }

  private shouldHaveUniqueIds(inputDescriptors: InputDescriptor[]): Validation<unknown> {
    const nonUniqueInputDescriptorIds: string[] = [];
    const uniqueInputDescriptorIds: Set<string> = new Set<string>();

    for (const inDesc of inputDescriptors) {
      const oldSize = uniqueInputDescriptorIds.size;
      uniqueInputDescriptorIds.add(inDesc.id);
      const newSize = uniqueInputDescriptorIds.size;

      if (oldSize === newSize) {
        nonUniqueInputDescriptorIds.push(inDesc.id);
      }
    }

    return {
      tag: this.getTag(),
      target: nonUniqueInputDescriptorIds,
      predicate: (nonUniqueInputDescriptorIds: string[]) => nonUniqueInputDescriptorIds.length === 0,
      message: this.idMustBeUniqueMsg,
    };
  }

  private shouldHaveUniqueFieldsIds(inputDescriptors: InputDescriptor[]): Validation<unknown> {
    const nonUniqueInputDescriptorFieldsIds: string[] = [];
    const uniqueInputDescriptorFieldsIds: Set<string> = new Set<string>();

    for (const inDesc of inputDescriptors) {
      if (inDesc.constraints != null) {
        for (const field of inDesc.constraints.fields) {
          if (field.id != null) {
            const oldSize = uniqueInputDescriptorFieldsIds.size;
            uniqueInputDescriptorFieldsIds.add(field.id);
            const newSize = uniqueInputDescriptorFieldsIds.size;

            if (oldSize === newSize) {
              nonUniqueInputDescriptorFieldsIds.push(field.id);
            }
          }
        }
      }
    }

    return {
      tag: this.getTag(),
      target: nonUniqueInputDescriptorFieldsIds,
      predicate: (nonUniqueInputDescriptorFieldsIds: string[]) => nonUniqueInputDescriptorFieldsIds.length === 0,
      message: this.fieldsIdMustBeUniqueMsg,
    };
  }

  isValidSchema(): ValidationPredicate<Array<Schema>> {
    // TODO extract to generic util or use built-in method
    return (schemas: Array<Schema>): boolean => {
      return (
        schemas.filter(
          (schema) => this.isAValidURI(schema.uri) && (schema.required == null || typeof schema.required == 'boolean')
        ).length > 0
      );
    };
  }

  isAValidURI(uri) {
    try {
      new URL(uri);
    } catch (err) {
      // console.log(err)
      return InputDescriptorsVB.isValidDIDURI(uri);
    }
    return true;
  }

  private static isValidDIDURI(uri) {
    const pchar = "[a-zA-Z-\\._~]|%[0-9a-fA-F]{2}|[!$&'()*+,;=:@]";
    const format =
      '^' +
      'did:' +
      '([a-z0-9]+)' + // method_name
      '(:' + // method-specific-id
      '([a-zA-Z0-9\\.\\-_]|%[0-9a-fA-F]{2})+' +
      ')+' +
      '(/(' +
      pchar +
      ')*)?'; // + // path-abempty
    '(\\?(' +
      pchar +
      '|/|\\?)+)?' + // [ "?" query ]
      '(#(' +
      pchar +
      '|/|\\?)+)?'; // [ "#" fragment ]
    ('$');
    return new RegExp(format).test(uri);
  }

  constraintsValidations(inputDescriptor: InputDescriptor, inDescInd: number): Validation<unknown>[] {
    if (inputDescriptor !== null) {
      return new ConstraintsVB(this.getMyTag(inDescInd)).getValidations(inputDescriptor.constraints);
    }
    return [];
  }
}
