import { Validator } from './validator';

export default class ValidationEngine {
  private targetObject: any;
  private validators: Validator<any>[];

  constructor() {
    this.validators = [];
  }

  public add(validator: Validator<any>): ValidationEngine {
    this.validators.push(validator);
    return this;
  }

  public target(targetObj: any): ValidationEngine {
    this.targetObject = targetObj;
    return this;
  }

  public validate(): Error[] {
    const validationErrors: Error[] = [];
    this.validators.forEach((validator: Validator<any>) => {
      try {
        validator.validate(this.targetObject);
      } catch (err) {
        validationErrors.push(err);
      }
    });
    return validationErrors;
  }
}
