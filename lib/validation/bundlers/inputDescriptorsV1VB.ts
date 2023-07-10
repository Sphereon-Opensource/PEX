import { ConstraintsV1, FieldV1, HolderSubject, InputDescriptorV1, Schema } from '@sphereon/pex-models';

import { ObjectValidationUtils } from '../../utils';
import { Validation, ValidationPredicate } from '../core';

import { ConstraintsVB } from './constraintsVB';
import { ValidationBundler } from './validationBundler';

export class InputDescriptorsV1VB extends ValidationBundler<InputDescriptorV1[]> {
  private readonly idMustBeNonEmptyStringMsg = 'input descriptor id must be non-empty string';
  private readonly nameShouldBeNonEmptyStringMsg = 'input descriptor name should be non-empty string';
  private readonly purposeShouldBeNonEmptyStringMsg = 'input descriptor purpose should be non-empty string';
  private readonly shouldHaveValidSchemaURIMsg = 'schema should have valid URI';

  constructor(parentTag: string) {
    super(parentTag, 'input_descriptor');
  }

  public getValidations(
    inputDescriptors: InputDescriptorV1[],
  ): (
    | Validation<InputDescriptorV1>
    | Validation<InputDescriptorV1[]>
    | Validation<ConstraintsV1>
    | Validation<FieldV1>
    | Validation<HolderSubject>
  )[] {
    let validations: (
      | Validation<InputDescriptorV1>
      | Validation<InputDescriptorV1[]>
      | Validation<ConstraintsV1>
      | Validation<FieldV1>
      | Validation<HolderSubject>
    )[] = [];

    validations.push(
      {
        tag: this.getTag(),
        target: inputDescriptors,
        predicate: (inDescs: InputDescriptorV1[]) => this.shouldHaveUniqueIds(inDescs),
        message: 'input descriptor ids must be unique',
      },
      {
        tag: this.getTag(),
        target: inputDescriptors,
        predicate: (inDescs: InputDescriptorV1[]) => this.shouldHaveUniqueFieldsIds(inDescs),
        message: 'fields id must be unique',
      },
    );

    inputDescriptors.forEach((inputDescriptor, inDescInd) => {
      validations = [
        ...validations,
        ...this.getValidationFor(inputDescriptor, inDescInd),
        ...this.constraintsValidations(inputDescriptor, inDescInd),
      ];
    });
    return validations;
  }

  private getValidationFor(inputDescriptor: InputDescriptorV1, inDescInd: number): Validation<InputDescriptorV1>[] {
    return [
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor,
        predicate: (inDesc: InputDescriptorV1) => ObjectValidationUtils.nonEmptyString(inDesc?.id),
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
        predicate: (inDesc: InputDescriptorV1) => ObjectValidationUtils.optionalNonEmptyString(inDesc?.name),
        message: this.nameShouldBeNonEmptyStringMsg,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor,
        predicate: (inDesc: InputDescriptorV1) => ObjectValidationUtils.optionalNonEmptyString(inDesc?.purpose),
        message: this.purposeShouldBeNonEmptyStringMsg,
      },
    ];
  }

  private shouldHaveUniqueFieldsIds(inputDescriptors: InputDescriptorV1[]): boolean {
    const nonUniqueInputDescriptorFieldsIds: string[] = [];
    const uniqueInputDescriptorFieldsIds: Set<string> = new Set<string>();
    const tmp: FieldV1[] = [];
    inputDescriptors
      .map((e) => e.constraints?.fields)
      .forEach((e) => {
        if (e) {
          tmp.push(...e);
        }
      });
    tmp.forEach((e) => {
      if (e.id) {
        nonUniqueInputDescriptorFieldsIds.push(e.id);
      }
    });
    nonUniqueInputDescriptorFieldsIds.forEach((id) => uniqueInputDescriptorFieldsIds.add(id));
    return nonUniqueInputDescriptorFieldsIds.length === uniqueInputDescriptorFieldsIds.size;
  }

  private shouldHaveUniqueIds(inputDescriptors: InputDescriptorV1[]): boolean {
    const nonUniqueInputDescriptorIds: string[] = [];
    const uniqueInputDescriptorIds: Set<string> = new Set<string>();
    inputDescriptors.forEach((e) => nonUniqueInputDescriptorIds.push(e.id));
    nonUniqueInputDescriptorIds.forEach((e) => uniqueInputDescriptorIds.add(e));
    return nonUniqueInputDescriptorIds.length === uniqueInputDescriptorIds.size;
  }

  protected getMyTag(srInd: number) {
    // TODO extract to make it generic
    return this.parentTag + '.' + this.myTag + '[' + srInd + ']';
  }

  isValidSchema(): ValidationPredicate<InputDescriptorV1> {
    // TODO extract to generic util or use built-in method
    return (inDesc: InputDescriptorV1): boolean => {
      return (
        inDesc.schema.filter((schema: Schema) => this.isAValidURI(schema.uri) && (schema.required == null || typeof schema.required == 'boolean'))
          .length > 0
      );
    };
  }

  isAValidURI(uri: string) {
    if (!uri) {
      return false;
    } else if (!ObjectValidationUtils.nonEmptyString(uri)) {
      return false;
    }
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      try {
        new URL(uri);
      } catch (err) {
        return ObjectValidationUtils.isValidDIDURI(uri);
      }
    }
    return true;
  }

  constraintsValidations(
    inputDescriptor: InputDescriptorV1,
    inDescInd: number,
  ): (Validation<ConstraintsV1> | Validation<FieldV1> | Validation<HolderSubject>)[] {
    if (inputDescriptor.constraints) {
      return new ConstraintsVB(this.getMyTag(inDescInd)).getValidations(inputDescriptor.constraints);
    }
    return [];
  }
}
