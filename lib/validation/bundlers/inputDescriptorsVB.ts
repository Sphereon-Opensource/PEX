import { Constraints, Field, HolderSubject, InputDescriptor, Schema } from '@sphereon/pe-models';

import { Validation, ValidationPredicate } from '../core';

import { ConstraintsVB } from './constraintsVB';
import { ValidationBundler } from './validationBundler';

export class InputDescriptorsVB extends ValidationBundler<InputDescriptor[]> {
  private readonly idMustBeNonEmptyStringMsg = 'input descriptor id must be non-empty string';
  private readonly nameShouldBeNonEmptyStringMsg = 'input descriptor name should be non-empty string';
  private readonly purposeShouldBeNonEmptyStringMsg = 'input descriptor purpose should be non-empty string';
  private readonly shouldHaveValidSchemaURIMsg = 'schema should have valid URI';

  constructor(parentTag: string) {
    super(parentTag, 'input_descriptor');
  }

  public getValidations(
    inputDescriptors: InputDescriptor[]
  ): (
    | Validation<InputDescriptor>
    | Validation<InputDescriptor[]>
    | Validation<Constraints>
    | Validation<Field>
    | Validation<HolderSubject>
  )[] {
    let validations: (
      | Validation<InputDescriptor>
      | Validation<InputDescriptor[]>
      | Validation<Constraints>
      | Validation<Field>
      | Validation<HolderSubject>
    )[] = [];

    validations.push(
      {
        tag: this.getTag(),
        target: inputDescriptors,
        predicate: (inDescs: InputDescriptor[]) => this.shouldHaveUniqueIds(inDescs),
        message: 'input descriptor ids must be unique',
      },
      {
        tag: this.getTag(),
        target: inputDescriptors,
        predicate: (inDescs: InputDescriptor[]) => this.shouldHaveUniqueFieldsIds(inDescs),
        message: 'fields id must be unique',
      }
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

  private shouldHaveUniqueFieldsIds(inputDescriptors: InputDescriptor[]): boolean {
    const nonUniqueInputDescriptorFieldsIds: string[] = [];
    const uniqueInputDescriptorFieldsIds: Set<string> = new Set<string>();
    const tmp: Field[] = [];
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

  private shouldHaveUniqueIds(inputDescriptors: InputDescriptor[]): boolean {
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

  private static nonEmptyString(id: string): boolean {
    // TODO extract to generic utils or use something like lodash
    return id != null && id.length > 0;
  }

  private static optionalNonEmptyString(name: string | undefined): boolean {
    // TODO extract to generic utils or use something like lodash
    return name == null || name.length > 0;
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
  ): (Validation<Constraints> | Validation<Field> | Validation<HolderSubject>)[] {
    if (inputDescriptor.constraints) {
      return new ConstraintsVB(this.getMyTag(inDescInd)).getValidations(inputDescriptor.constraints);
    }
    return [];
  }
}
