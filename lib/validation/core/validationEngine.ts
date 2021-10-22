import { ValidationBundler } from '../bundlers';

import { validate, Validated, Validation } from './index';

export interface Validator<T> {
  bundler: ValidationBundler<T>;
  target: T;
}

export class ValidationEngine<T> {
  validate(validators: Validator<T>[]): Validated {
    let validations: Validation<T>[] = [];

    for (const validator of validators) {
      validations = validations.concat(validator.bundler.getValidations(validator.target));
    }

    return validate(validations);
  }
}
