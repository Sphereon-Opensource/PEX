import { Checked, Status } from '../../ConstraintUtils';
import { Validation } from '../core';

export abstract class ValidationBundler<T> {
  parentTag: string;
  myTag: string;

  protected constructor(parentTag: string, myTag: string) {
    this.parentTag = parentTag;
    this.myTag = myTag;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public abstract getValidations(t: T | T[]): Validation<any>[];

  protected getTag() {
    return this.parentTag != null ? this.parentTag + '.' + this.myTag : this.myTag;
  }

  protected toChecked(message: string) {
    return new Checked(this.getTag(), Status.ERROR, message);
  }
}
