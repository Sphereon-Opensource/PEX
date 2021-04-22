import Ajv from 'ajv';
import jp from 'jsonpath';
import {
  Field,
  Filter,
  InputDescriptors,
  PresentationDefinition,
} from 'pe-models';

import { executeValidations, Validated } from '../core';
import { ValidationError } from '../core/errors/validationError';
import { isField } from '../core/typeGuards';

import { BaseValidator } from './baseValidator';

export class FieldObjectValidator extends BaseValidator<Field> {
  private schemaValidator: Ajv;

  constructor() {
    super();
    this.schemaValidator = new Ajv();
  }

  protected filter(input: any): Field | Field[] {
    if (isField(input)) {
      return input as Field;
    }

    const pd = input as PresentationDefinition;
    let fields = [];
    pd.input_descriptors.map((input: InputDescriptors) => {
      fields = [...fields, ...input.constraints.fields];
    });
    return fields;
  }

  _validate(fieldObj: Field): Validated<Field> {
    return executeValidations(fieldObj, [
      [
        (fieldObj): boolean => fieldObj.path == null,
        'field object must contain non-null path',
      ],
      [
        (fieldObj): boolean => fieldObj.path.length < 1,
        'field object "path" property must have length > 0',
      ],
      [
        (fieldObj: Field): boolean => this._validateJsonPaths(fieldObj.path),
        'field object "path" property must contain array of valid json paths',
      ],
      [
        (fieldObj: Field): boolean => this._validateFilter(fieldObj.filter),
        'field object "filter" property must be valid json schema',
      ],
      [
        (fieldObj: Field): boolean =>
          fieldObj.predicate != null && fieldObj.filter == null,
        'field object must have a "filter" property if "predicate" is present',
      ],
    ]);
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
      throw new ValidationError(
        'field object "path" property must contain valid json paths. Got: ' +
          JSON.stringify(invalidPaths)
      );
    }
    return true;
  }

  private _validateFilter(filter: Filter): boolean {
    if (filter == null) {
      return true;
    }
    try {
      this.schemaValidator.compile(filter);
    } catch (err) {
      throw new ValidationError(
        'could not parse "filter" object as a valid json schema descriptor. Got ' +
          JSON.stringify(filter)
      );
    }
    return true;
  }
}
