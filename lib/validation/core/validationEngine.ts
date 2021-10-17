import { ValidationBundler } from '../bundlers';

import { validate, Validation } from './index';

export interface Validator<T> {
  bundler: ValidationBundler<T>;
  target: T;
}

export class ValidationEngine<T> {
  validate(validators: Validator<T>[]) {
    let validations: Validation<unknown>[] = [];

    for (const validator of validators) {
      validations = validations.concat(validator.bundler.getValidations(validator.target));
    }

    return validate(validations);
  }
}
