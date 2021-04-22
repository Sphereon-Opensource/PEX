import { Validated } from '../core';

export abstract class BaseValidator<Type> {
  protected abstract filter(input: any): Type | Type[];

  protected abstract _validate(input: Type): Validated<Type>;

  validate(input: any): Validated<Type> | Validated<Type>[] {
    const objToValidate = this.filter(input);
    if (!Array.isArray(objToValidate)) {
      return this._validate(objToValidate);
    } else {
      return objToValidate.map((o: Type) => this._validate(o));
    }
  }
}
