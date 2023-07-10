import { ConstraintsV2, FieldV2, HolderSubject, InputDescriptorV2 } from '@sphereon/pex-models';

import { ObjectValidationUtils } from '../../utils';
import { Validation } from '../core';

import { ConstraintsVB } from './constraintsVB';
import { ValidationBundler } from './validationBundler';

export class InputDescriptorsV2VB extends ValidationBundler<InputDescriptorV2[]> {
  private readonly idMustBeNonEmptyStringMsg = 'input descriptor id must be non-empty string';
  private readonly nameShouldBeNonEmptyStringMsg = 'input descriptor name should be non-empty string';
  private readonly purposeShouldBeNonEmptyStringMsg = 'input descriptor purpose should be non-empty string';

  constructor(parentTag: string) {
    super(parentTag, 'input_descriptor');
  }

  public getValidations(
    inputDescriptors: InputDescriptorV2[],
  ): (
    | Validation<InputDescriptorV2>
    | Validation<InputDescriptorV2[]>
    | Validation<ConstraintsV2>
    | Validation<FieldV2>
    | Validation<HolderSubject>
  )[] {
    let validations: (
      | Validation<InputDescriptorV2>
      | Validation<InputDescriptorV2[]>
      | Validation<ConstraintsV2>
      | Validation<FieldV2>
      | Validation<HolderSubject>
    )[] = [];

    validations.push(
      {
        tag: this.getTag(),
        target: inputDescriptors,
        predicate: (inDescs: InputDescriptorV2[]) => this.shouldNotHaveSchema(inDescs),
        message: 'input descriptor should not have schema property',
      },
      {
        tag: this.getTag(),
        target: inputDescriptors,
        predicate: (inDescs: InputDescriptorV2[]) => this.shouldHaveUniqueIds(inDescs),
        message: 'input descriptor ids must be unique',
      },
      {
        tag: this.getTag(),
        target: inputDescriptors,
        predicate: (inDescs: InputDescriptorV2[]) => this.shouldHaveUniqueFieldsIds(inDescs),
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

  private getValidationFor(inputDescriptor: InputDescriptorV2, inDescInd: number): Validation<InputDescriptorV2>[] {
    return [
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor,
        predicate: (inDesc: InputDescriptorV2) => ObjectValidationUtils.nonEmptyString(inDesc?.id),
        message: this.idMustBeNonEmptyStringMsg,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor,
        predicate: (inDesc: InputDescriptorV2) => ObjectValidationUtils.optionalNonEmptyString(inDesc?.name),
        message: this.nameShouldBeNonEmptyStringMsg,
      },
      {
        tag: this.getMyTag(inDescInd),
        target: inputDescriptor,
        predicate: (inDesc: InputDescriptorV2) => ObjectValidationUtils.optionalNonEmptyString(inDesc?.purpose),
        message: this.purposeShouldBeNonEmptyStringMsg,
      },
    ];
  }

  private shouldHaveUniqueFieldsIds(inputDescriptors: InputDescriptorV2[]): boolean {
    const nonUniqueInputDescriptorFieldsIds: string[] = [];
    const uniqueInputDescriptorFieldsIds: Set<string> = new Set<string>();
    const tmp: FieldV2[] = [];
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

  private shouldHaveUniqueIds(inputDescriptors: InputDescriptorV2[]): boolean {
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

  constraintsValidations(
    inputDescriptor: InputDescriptorV2,
    inDescInd: number,
  ): (Validation<ConstraintsV2> | Validation<FieldV2> | Validation<HolderSubject>)[] {
    if (inputDescriptor.constraints) {
      return new ConstraintsVB(this.getMyTag(inDescInd)).getValidations(inputDescriptor.constraints);
    }
    return [];
  }

  private shouldNotHaveSchema(inputDescriptors: InputDescriptorV2[]) {
    let hasSchema = false;
    inputDescriptors.forEach((id) => {
      if (id['schema' as keyof InputDescriptorV2]) {
        hasSchema = true;
      }
    });
    return !hasSchema;
  }
}
