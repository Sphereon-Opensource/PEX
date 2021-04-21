import Ajv from 'ajv';
import jp from 'jsonpath';
import {
  Field,
  Filter,
  InputDescriptors,
  PresentationDefinition,
} from 'pe-models';

import { ValidationError } from './errors/validationError';
import { isField } from './typeGuards';
import { Validator } from './validator';
import { validate } from './utils';

export class FieldObjectValidator extends Validator<Field> {
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

  _validate(fieldObj: Field): void {
    validate(
      fieldObj,
      [
        [(fieldObj): boolean => fieldObj.path == null, 'field object must contain non-null path'],
        [(fieldObj): boolean => fieldObj.path.length < 1, 'field object "path" property must have length > 0']
      ]);
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
