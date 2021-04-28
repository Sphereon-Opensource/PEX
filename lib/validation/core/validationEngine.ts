import {ValidationBundler} from "../bundlers";

import { validate, Validation } from './index';

export type Validator = [bundlers: ValidationBundler<any>, target: any];

export class ValidationEngine {
  validate(validators: Validator[]) {
    let validations: Validation<any>[] = [];

    for (const validator of validators) {
      validations = validations.concat(
        validator[0].getValidations(validator[1])
      );
    }

    return validate(validations);
  }
}
