import { ValidationBundler } from '../bundlers';

import { validate, Validation } from './index';

export class Validator {
  bundler: ValidationBundler<unknown>;
  target: any;
}

export class ValidationEngine {
  validate(validators: Validator[]) {
    let validations: Validation<any>[] = [];

    for (const validator of validators) {
      validations = validations.concat(
        validator.bundler.getValidations(validator.target)
      );
    }

    return validate(validations);
  }
}
