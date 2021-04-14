import { FieldObjectValidator } from './fieldObjectValidator';

export default class ValidationEngine {
  protected fieldObjectValidator: FieldObjectValidator;

  constructor() {
    this.fieldObjectValidator = new FieldObjectValidator();
  }
}
