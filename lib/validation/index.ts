import { areInvalid, Invalid } from './core';
import { BaseValidator } from './validators/baseValidator';

export class ValidationEngine {
  private targetObject: any;
  private validators: BaseValidator<any>[];

  constructor() {
    this.validators = [];
  }

  public add(validator: BaseValidator<any>): ValidationEngine {
    this.validators.push(validator);
    return this;
  }

  public target(targetObj: any): ValidationEngine {
    this.targetObject = targetObj;
    return this;
  }

  public validate(): Invalid[] {
    let validationErrors: Invalid[] = [];
    this.validators.forEach((validator: BaseValidator<any>) => {
      const validated = validator.validate(this.targetObject);
      if (areInvalid(validated)) {
        validationErrors = [...validationErrors, ...(validated as Invalid[])];
      }
    });
    return validationErrors;
  }
}
