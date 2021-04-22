import { areInvalid, Invalid, Validated } from '../core';

export abstract class BaseValidator<Type> {
  protected abstract filter(input: any): Type | Type[];

  protected abstract _validate(input: Type): Validated<Type>;

  validate(input: any): Invalid[] {
    const objToValidate = this.filter(input);
    let results: Invalid[] = [];
    if (!Array.isArray(objToValidate)) {
      const validated = this._validate(objToValidate);
      if (areInvalid(validated)) {
        results = validated as Invalid[];
      }
    } else {
      objToValidate.forEach((o: Type) => {
        const validated = this._validate(o);
        if (areInvalid(validated)) {
          results = [...results, ...(validated as Invalid[])];
        }
      });
    }
    return results;
  }
}
