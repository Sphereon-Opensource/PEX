import Ajv from 'ajv';
import jp from 'jsonpath';
import { Field, Filter } from 'pe-models';

import { Predicate, Validation } from '../core';

import { ValidationBundler } from './validationBundler';

export class FieldObjectVB extends ValidationBundler<Field> {
  private schemaValidator: Ajv;

  private readonly pathMustHaveValidJsonPathsMsg =
    'field object "path" property must contain array of valid json paths';
  private readonly pathObjMustHaveValidJsonPathsMsg =
    'field object "path" property must contain valid json paths.';
  private readonly filterMustBeValidJsonSchemaMsg =
    'field object "filter" property must be valid json schema';
  private readonly filterIsMustInPresenceOfPredicateMsg =
    'field object must have a "filter" property if "predicate" is present';
  private readonly filterIsNotValidJsonSchemaDescriptorMsg =
    'could not parse "filter" object as a valid json schema descriptor.';

  constructor(parentTag: string) {
    super(parentTag, 'field');
    this.schemaValidator = new Ajv();
  }

  public getValidations(fieldObj: Field): Validation<Field>[] {
    return [
      [
        this.getTag(),
        fieldObj,
        this.pathMustHaveValidJsonPaths(),
        this.pathMustHaveValidJsonPathsMsg,
      ],
      [
        this.getTag(),
        fieldObj,
        this.filterMustBeValidJsonSchema(),
        this.filterMustBeValidJsonSchemaMsg,
      ],
      [
        this.getTag(),
        fieldObj,
        this.filterIsMustInPresenceOfPredicate(),
        this.filterIsMustInPresenceOfPredicateMsg,
      ],
    ];
  }

  private pathMustHaveValidJsonPaths(): Predicate<Field> {
    return (fieldObj: Field): boolean =>
      fieldObj.path != null &&
      fieldObj.path.length > 0 &&
      this._validateJsonPaths(fieldObj.path);
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
      throw this.toChecked(
        this.pathObjMustHaveValidJsonPathsMsg +
          ' Got: ' +
          JSON.stringify(invalidPaths)
      );
    }
    return true;
  }

  private filterMustBeValidJsonSchema() {
    return (fieldObj: Field): boolean => this._validateFilter(fieldObj.filter);
  }

  private _validateFilter(filter: Filter | undefined): boolean {
    if (filter == null) {
      return true;
    }
    try {
      this.schemaValidator.compile(filter);
    } catch (err) {
      throw this.toChecked(
        this.filterIsNotValidJsonSchemaDescriptorMsg +
          ' Got ' +
          JSON.stringify(filter)
      );
    }
    return true;
  }

  private filterIsMustInPresenceOfPredicate() {
    return (fieldObj: Field): boolean =>
      !(fieldObj.predicate != null && fieldObj.filter == null);
  }
}
