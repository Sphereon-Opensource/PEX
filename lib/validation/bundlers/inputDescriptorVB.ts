import { URL } from 'url';

import { InputDescriptors } from 'pe-models';
import { Schema } from 'pe-models/model/schema';

import { Predicate, Validation } from '../core';

import { ConstraintsVB } from './constraintsVB';
import { ValidationBundler } from './validationBundler';

export class InputDescriptorVB extends ValidationBundler<InputDescriptors> {
  private readonly nonEmptyString =
    'input descriptor id must be non-empty string';
  private readonly optionalNonEmptyString =
    'input descriptor field should be non-empty string';
  private readonly idMustBeUnique = 'id must be unique';
  private readonly fieldsIdMustBeUnique = 'fields id must be unique';
  private readonly shouldHaveValidSchema = 'schema should have valid URI';

  constructor(parentTag: string) {
    super(parentTag, 'input_descriptor');
  }

  public getValidations(inDesc: InputDescriptors[]): Validation<unknown>[] {
    let validations: Validation<unknown>[] = [];
    for (let inDescInd = 0; inDescInd < inDesc.length; inDescInd++) {
      validations = [
        ...validations,
        ...this.getMyValidations(inDescInd, inDesc[inDescInd]),
      ];
    }

    validations = [
      ...validations,
      this.shouldHaveUniqueIds(inDesc),
      this.shouldHaveUniqueFieldsIds(inDesc),
    ];
    return validations;
  }

  private getMyValidations(
    inDescInd: number,
    inDesc: InputDescriptors
  ): Validation<unknown>[] {
    return [
      {
        tag: this.getMyTag(inDescInd),
        target: inDesc?.id,
        predicate: InputDescriptorVB.nonEmptyString,
        message: this.nonEmptyString,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inDesc?.schema,
        predicate: this.isValidSchema(),
        message: this.shouldHaveValidSchema,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inDesc?.name,
        predicate: InputDescriptorVB.optionalNonEmptyString,
        message: this.optionalNonEmptyString,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inDesc?.purpose,
        predicate: InputDescriptorVB.optionalNonEmptyString,
        message: this.optionalNonEmptyString,
      },
      ...this.constraintsValidations(inDesc),
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
    inputDescriptors: InputDescriptors[]
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
      message: this.idMustBeUnique,
    };
  }

  private shouldHaveUniqueFieldsIds(
    inputDescriptors: InputDescriptors[]
  ): Validation<unknown> {
    const nonUniqueInputDescriptorFieldsIds: string[] = [];
    const uniqueInputDescriptorFieldsIds: Set<string> = new Set<string>();

    for (const inDesc of inputDescriptors) {
      for (const field of inDesc.constraints.fields) {
        const oldSize = uniqueInputDescriptorFieldsIds.size;
        uniqueInputDescriptorFieldsIds.add(field.id);
        const newSize = uniqueInputDescriptorFieldsIds.size;

        if (oldSize === newSize) {
          nonUniqueInputDescriptorFieldsIds.push(field.id);
        }
      }
    }

    return {
      tag: this.getTag(),
      target: nonUniqueInputDescriptorFieldsIds,
      predicate: (nonUniqueInputDescriptorFieldsIds: string[]) =>
        nonUniqueInputDescriptorFieldsIds.length === 0,
      message: this.fieldsIdMustBeUnique,
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

  isAValidURI(s) {
    try {
      new URL(s);
    } catch (err) {
      return false;
    }

    return true;
  }

  constraintsValidations(
    inputDescriptors: InputDescriptors
  ): Validation<unknown>[] {
    if (inputDescriptors !== null) {
      return new ConstraintsVB(this.getTag()).getValidations(
        inputDescriptors.constraints
      );
    }
    return [];
  }
}
