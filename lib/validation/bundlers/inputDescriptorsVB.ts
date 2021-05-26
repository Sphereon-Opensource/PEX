import { URL } from 'url';

import { InputDescriptor, Schema } from '@sphereon/pe-models';

import { Predicate, Validation } from '../core';

import { ConstraintsVB } from './constraintsVB';
import { ValidationBundler } from './validationBundler';

export class InputDescriptorsVB extends ValidationBundler<InputDescriptor[]> {
  private readonly idMustBeNonEmptyStringMsg =
    'input descriptor id must be non-empty string';
  private readonly nameShouldBeNonEmptyStringMsg =
    'input descriptor name should be non-empty string';
  private readonly purposeShouldBeNonEmptyStringMsg =
    'input descriptor purpose should be non-empty string';
  private readonly idMustBeUniqueMsg = 'input descriptor id must be unique';
  private readonly fieldsIdMustBeUniqueMsg = 'fields id must be unique';
  private readonly shouldHaveValidSchemaURIMsg = 'schema should have valid URI';

  constructor(parentTag: string) {
    super(parentTag, 'input_descriptor');
  }

  public getValidations(
    inputDescriptors: InputDescriptor[]
  ): Validation<unknown>[] {
    let validations: Validation<unknown>[] = [];

    inputDescriptors.forEach((inputDescriptor, inDescInd) => {
      validations = [
        ...validations,
        ...this.getValidationFor(inputDescriptor, inDescInd),
      ];
    });

    validations = [
      ...validations,
      this.shouldHaveUniqueIds(inputDescriptors),
      this.shouldHaveUniqueFieldsIds(inputDescriptors),
    ];

    return validations;
  }

  private getValidationFor(
    inputDescriptor: InputDescriptor,
    inDescInd: number
  ): Validation<unknown>[] {
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

  private shouldHaveUniqueIds(
    inputDescriptors: InputDescriptor[]
  ): Validation<unknown> {
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
      predicate: (nonUniqueInputDescriptorIds: string[]) =>
        nonUniqueInputDescriptorIds.length === 0,
      message: this.idMustBeUniqueMsg,
    };
  }

  private shouldHaveUniqueFieldsIds(
    inputDescriptors: InputDescriptor[]
  ): Validation<unknown> {
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
      predicate: (nonUniqueInputDescriptorFieldsIds: string[]) =>
        nonUniqueInputDescriptorFieldsIds.length === 0,
      message: this.fieldsIdMustBeUniqueMsg,
    };
  }

  isValidSchema(): Predicate<Array<Schema>> {
    // TODO extract to generic util or use built-in method
    return (schemas: Array<Schema>): boolean => {
      return (
        schemas.filter(
          (schema) =>
            this.isAValidURI(schema.uri) &&
            (schema.required == null || typeof schema.required == 'boolean')
        ).length > 0
      );
    };
  }

  isAValidURI(url) {
    try {
      new URL(url);
    } catch (err) {
      // console.log(err)
      return InputDescriptorsVB.isValidDIDURL(url);
    }
    return true;
  }

  private static isValidDIDURL(url) {
    const pchar = "[a-zA-Z-\\._~]|%[0-9a-fA-F]{2}|[!$&'()*+,;=:@]";
    const didUrlFormat =
      '^' +
      'hub://' +
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
    return new RegExp(didUrlFormat).test(url);
  }

  constraintsValidations(
    inputDescriptor: InputDescriptor,
    inDescInd: number
  ): Validation<unknown>[] {
    if (inputDescriptor !== null) {
      return new ConstraintsVB(this.getMyTag(inDescInd)).getValidations(
        inputDescriptor.constraints
      );
    }
    return [];
  }
}
