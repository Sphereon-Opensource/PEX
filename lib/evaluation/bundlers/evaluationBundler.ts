import { Checked, Status } from '../../ConstraintUtils';
import { Evaluation } from '../core';

export abstract class EvaluationBundler<T> {
  parentTag: string;
  myTag: string;

  protected constructor(parentTag: string, myTag: string) {
    this.parentTag = parentTag;
    this.myTag = myTag;
  }

  public abstract getEvaluations(t: T | T[]): Evaluation<any>[];

  protected getTag() {
    return this.parentTag != null ? this.parentTag + '.' + this.myTag : this.myTag;
  }

  protected toChecked(message: string) {
    return new Checked(this.getTag(), Status.ERROR, message);
  }
}
