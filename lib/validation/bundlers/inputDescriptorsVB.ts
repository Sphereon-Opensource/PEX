import { Constraints, Field, InputDescriptor, Schema } from '@sphereon/pe-models';

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

  public getValidations(
    inputDescriptors: InputDescriptor[]
  ): (Validation<InputDescriptor> | Validation<Constraints> | Validation<Field>)[] {
    let validations: (Validation<InputDescriptor> | Validation<Constraints> | Validation<Field>)[] = [];

    inputDescriptors.forEach((inputDescriptor, inDescInd) => {
      validations = [
        ...validations,
        ...this.getValidationFor(inputDescriptor, inDescInd),
        ...this.constraintsValidations(inputDescriptor, inDescInd),
      ];
    });

    validations = [
      ...validations,
      this.shouldHaveUniqueIds(inputDescriptors),
      this.shouldHaveUniqueFieldsIds(inputDescriptors),
    ];

    return validations;
  }

  private getValidationFor(inputDescriptor: InputDescriptor, inDescInd: number): Validation<InputDescriptor>[] {
    return [
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor,
        predicate: (inDesc: InputDescriptor) => InputDescriptorsVB.nonEmptyString(inDesc?.id),
        message: this.idMustBeNonEmptyStringMsg,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor,
        predicate: this.isValidSchema(),
        message: this.shouldHaveValidSchemaURIMsg,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor,
        predicate: (inDesc: InputDescriptor) => InputDescriptorsVB.optionalNonEmptyString(inDesc?.name),
        message: this.nameShouldBeNonEmptyStringMsg,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor,
        predicate: (inDesc: InputDescriptor) => InputDescriptorsVB.optionalNonEmptyString(inDesc?.purpose),
        message: this.purposeShouldBeNonEmptyStringMsg,
      },
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

  private static optionalNonEmptyString(name: string | undefined): boolean {
    // TODO extract to generic utils or use something like lodash
    return name == null || name.length > 0;
  }

  private shouldHaveUniqueIds(inputDescriptors: InputDescriptor[]): Validation<any> {
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

  private shouldHaveUniqueFieldsIds(inputDescriptors: InputDescriptor[]): Validation<any> {
    const nonUniqueInputDescriptorFieldsIds: string[] = [];
    const uniqueInputDescriptorFieldsIds: Set<string> = new Set<string>();

    for (const inDesc of inputDescriptors) {
      if (inDesc.constraints && inDesc.constraints.fields) {
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

  isValidSchema(): ValidationPredicate<InputDescriptor> {
    // TODO extract to generic util or use built-in method
    return (inDesc: InputDescriptor): boolean => {
      return (
        inDesc.schema.filter(
          (schema: Schema) =>
            this.isAValidURI(schema.uri) && (schema.required == null || typeof schema.required == 'boolean')
        ).length > 0
      );
    };
  }

  isAValidURI(uri: string) {
    try {
      new URL(uri);
    } catch (err) {
      // console.log(err)
      return InputDescriptorsVB.isValidDIDURI(uri);
    }
    return true;
  }

  private static isValidDIDURI(uri: string) {
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

  constraintsValidations(
    inputDescriptor: InputDescriptor,
    inDescInd: number
  ): (Validation<Constraints> | Validation<Field>)[] {
    if (inputDescriptor.constraints) {
      return new ConstraintsVB(this.getMyTag(inDescInd)).getValidations(inputDescriptor.constraints);
    }
    return [];
  }
}
