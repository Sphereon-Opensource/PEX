import { Checked, hasErrors, Status } from '../../ConstraintUtils';

import { Validated } from './validated';

export type ValidationPredicate<T> = (t: T) => boolean;

export interface Validation<T> {
  tag: string;
  target: T;
  predicate: ValidationPredicate<T>;
  message: string;
  status?: Status;
}

export type ValidateAll = <T>(validations: Validation<T>[]) => Validated;

export const validate: ValidateAll = <T>(validations: Validation<T>[]): Validated => {
  const validateResults: Checked[] = validations.map((validation) => mapper(validation));

  function toChecked(validation: Validation<T>) {
    return new Checked(validation.tag, Status.ERROR, validation.message);
  }

  function toCheckedSuccess(tag: string) {
    return new Checked(tag, Status.INFO, 'ok');
  }

  function mapper(validation: Validation<T>): Checked {
    let result;

    try {
      if (validation.predicate(validation.target)) {
        result = toCheckedSuccess(validation.tag);
      } else {
        result = toChecked(validation);
      }
    } catch (error) {
      result = toChecked(validation);
    }
    return result;
  }

  const accumulateErrors = (accumulator: Checked[], checked: Checked): Checked[] => {
    if (checked.status !== Status.INFO) {
      accumulator.push(checked);
    }
    return accumulator;
  };

  const validated: Checked[] = validateResults.reduce(accumulateErrors, []);

  if (hasErrors(validated)) {
    return validated as Validated;
  } else {
    return [toCheckedSuccess('root')];
  }
};
