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

  public validate(): Error[] {
    const validationErrors: Error[] = [];
    this.validators.forEach((validator: BaseValidator<any>) => {
      try {
        validator.validate(this.targetObject);
      } catch (err) {
        validationErrors.push(err);
      }
    });
    return validationErrors;
  }
}
