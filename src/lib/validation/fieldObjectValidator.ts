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
import { validate } from './utils/index';

export class FieldObjectValidator {
  private schemaValidator: Ajv;

  constructor() {
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

  validate(fieldObj: Field): void {
    validate(
      fieldObj,
      [
        [(fieldObj): boolean => fieldObj.path == null, 'field object must contain non-null path'],
        [(fieldObj): boolean => fieldObj.path.length < 1, 'field object "path" property must have length > 0']
      ]);

    // TODO [Scott] following are yet to be converted. I hope converting these will introduce you to the new design.
    // TODO [Scott, continued] It is up to the this method how they want to implement
    // TODO [Scott, continued] e.g. if one likes they can combine all the validations in one function.
    // TODO [Scott, continued] It is possible it is not recommended.

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
