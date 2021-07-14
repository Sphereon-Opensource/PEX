import { ValidationBundler } from '../bundlers';

import { validate, Validation } from './index';

export class Validator {
  bundler: ValidationBundler<unknown>;
  target: unknown;
}

export class ValidationEngine {
  validate(validators: Validator[]) {
    let validations: Validation<unknown>[] = [];

    for (const validator of validators) {
      validations = validations.concat(validator.bundler.getValidations(validator.target));
    }

    return validate(validations);
  }
}
