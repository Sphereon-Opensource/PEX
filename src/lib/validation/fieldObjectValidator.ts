import Ajv from 'ajv';
import jp from 'jsonpath';
import { Field, Filter } from 'pe-models';

import { ValidationError } from './errors/validationError';

interface ObjectValidator {
  validate(obj: Field): void;
}

export class FieldObjectValidator implements ObjectValidator {
  private schemaValidator: Ajv;

  constructor() {
    this.schemaValidator = new Ajv();
  }

  validate(fieldObj: Field): void {
    if (fieldObj.path == null) {
      throw new ValidationError('field object must contain non-null path');
    }
    if (fieldObj.path.length < 1) {
      throw new ValidationError(
        'field object "path" property must have length > 0'
      );
    }
    this._validateJsonPaths(fieldObj.path);
    if (fieldObj.filter != null) {
      this._validateFilter(fieldObj.filter);
    }
    if (fieldObj.predicate != null && fieldObj.filter == null) {
      throw new ValidationError(
        'field object must have a "filter" property if "predicate" is present'
      );
    }
  }

  private _validateJsonPaths(jsonPath: string[]): void {
    const invalidPaths: string[] = [];
    jsonPath.forEach((path: string) => {
      try {
        jp.parse(path);
      } catch (err) {
        invalidPaths.push(path);
      }
    });
    if (invalidPaths.length > 0) {
      throw new ValidationError(
        'field object "path" property must contain valid json paths. Got: ' +
          JSON.stringify(invalidPaths)
      );
    }
  }

  private _validateFilter(filter: Filter): void {
    try {
      this.schemaValidator.compile(filter);
    } catch (err) {
      throw new ValidationError(
        'could not parse "filter" object as a valid json schema descriptor. Got ' +
          JSON.stringify(filter)
      );
    }
  }
}
