import { FieldV1, FieldV2, FilterV1, FilterV2, Optionality } from '@sphereon/pex-models';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import jp from 'jsonpath';

import { Validation, ValidationPredicate } from '../core';

import { ValidationBundler } from './validationBundler';

export class FieldsVB extends ValidationBundler<FieldV1[] | FieldV2[]> {
  private readonly schemaValidator: Ajv;

  private readonly mustHaveValidJsonPathsMsg = 'field object "path" property must contain array of valid json paths';
  private readonly pathObjMustHaveValidJsonPathMsg = 'field object "path" property must contain valid json paths.';
  private readonly filterMustBeValidJsonSchemaMsg = 'field object "filter" property must be valid json schema';
  private readonly filterIsMustInPresenceOfPredicateMsg =
    'field object must have a "filter" property if "predicate" is present';
  private readonly filterIsNotValidJsonSchemaDescriptorMsg =
    'could not parse "filter" object as a valid json schema descriptor.';
  private readonly purposeShouldBeANonEmptyStringMsg = 'purpose should be a non empty string';
  private readonly shouldBeKnownOptionMsg = 'Unknown predicate property';

  constructor(parentTag: string) {
    super(parentTag, 'fields');
    this.schemaValidator = new Ajv();
    addFormats(this.schemaValidator);
  }

  public getValidations(fields: FieldV1[] | FieldV2[]): Validation<FieldV1 | FieldV2>[] {
    let validations: Validation<FieldV1 | FieldV2>[] = [];
    if (fields) {
      for (let srInd = 0; srInd < fields.length; srInd++) {
        validations = [...validations, ...this.getValidationsFor(fields[srInd], srInd)];
      }
    }
    return validations;
  }

  public getValidationsFor(field: FieldV1 | FieldV2, indx: number): Validation<FieldV1 | FieldV2>[] {
    return [
      {
        tag: this.getMyTag(indx),
        target: field,
        predicate: this.mustHaveValidJsonPaths(),
        message: this.mustHaveValidJsonPathsMsg,
      },
      {
        tag: this.getMyTag(indx),
        target: field,
        predicate: this.filterMustBeValidJsonSchema(),
        message: this.filterMustBeValidJsonSchemaMsg,
      },
      {
        tag: this.getMyTag(indx),
        target: field,
        predicate: this.filterIsMustInPresenceOfPredicate(),
        message: this.filterIsMustInPresenceOfPredicateMsg,
      },
      {
        tag: this.getMyTag(indx),
        target: field,
        predicate: (field: FieldV1 | FieldV2) => FieldsVB.optionalNonEmptyString(field?.purpose),
        message: this.purposeShouldBeANonEmptyStringMsg,
      },
      {
        tag: this.getMyTag(indx),
        target: field,
        predicate: (field: FieldV1 | FieldV2) => FieldsVB.shouldBeKnownOption(field?.predicate),
        message: this.shouldBeKnownOptionMsg,
      },
    ];
  }

  protected getMyTag(srInd: number) {
    // TODO extract to make it generic
    return this.parentTag + '.' + this.myTag + '[' + srInd + ']';
  }

  private mustHaveValidJsonPaths(): ValidationPredicate<FieldV1 | FieldV2> {
    return (fieldObj: FieldV1 | FieldV2): boolean =>
      fieldObj.path != null && fieldObj.path.length > 0 && this._validateJsonPaths(fieldObj.path);
  }

  private _validateJsonPaths(jsonPath: string[]): boolean {
    const invalidPaths: string[] = [];
    jsonPath.forEach((path: string) => {
      try {
        jp.parse(path);
      } catch (err) {
        invalidPaths.push(path);
      }
    });
    if (invalidPaths.length > 0) {
      throw this.toChecked(this.pathObjMustHaveValidJsonPathMsg + ' Got: ' + JSON.stringify(invalidPaths));
    }
    return true;
  }

  private filterMustBeValidJsonSchema() {
    return (fieldObj: FieldV1 | FieldV2): boolean => this._validateFilter(fieldObj.filter);
  }

  private _validateFilter(filter: FilterV1 | FilterV2 | undefined): boolean {
    if (filter == null) {
      return true;
    }
    try {
      this.schemaValidator.compile(filter);
    } catch (err) {
      throw this.toChecked(this.filterIsNotValidJsonSchemaDescriptorMsg + ' Got ' + JSON.stringify(filter));
    }
    return true;
  }

  private filterIsMustInPresenceOfPredicate() {
    return (fieldObj: FieldV1 | FieldV2): boolean => !(fieldObj.predicate != null && fieldObj.filter == null);
  }

  private static optionalNonEmptyString(str: string | undefined): boolean {
    // TODO extract to generic utils or use something like lodash
    return str == null || str.length > 0;
  }

  private static shouldBeKnownOption(option: Optionality | undefined): boolean {
    // TODO can be be extracted as a generic function
    return option == null || option == Optionality.Required || option == Optionality.Preferred;
  }
}
