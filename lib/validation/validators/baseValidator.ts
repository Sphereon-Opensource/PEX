export abstract class BaseValidator<Type> {
  protected abstract filter(input: any): Type | Type[];

  protected abstract _validate(input: Type): void;

  validate(input: any): void {
    const objToValidate = this.filter(input);
    if (!Array.isArray(objToValidate)) {
      this._validate(objToValidate);
    } else {
      objToValidate.map((o: Type) => this._validate(o));
    }
  }
}
