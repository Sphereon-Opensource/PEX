import { Checked, Status, Validated } from './validated';
import { hasErrors } from './validationUtils';

export type Predicate<T> = (t: T) => boolean;
export type Validation<T> = [
  tag: string,
  target: T,
  predicate: Predicate<T>,
  message: string,
  status?: Status
];
export type ValidateAll = <T>(validations: Validation<T>[]) => Validated;

export const validate: ValidateAll = <T>(
  validations: Validation<T>[]
): Validated => {
  const validateResults: Checked[] = validations.map((validation) =>
    mapper(validation)
  );

  function toChecked(validation: Validation<T>) {
    return new Checked(validation[0], Status.ERROR, validation[3]);
  }

  function toCheckedSuccess(tag: string) {
    return new Checked(tag, Status.INFO, 'ok');
  }

  function mapper(validation: Validation<T>): Checked {
    let result;

    try {
      if (validation[2](validation[1])) {
        const tag = validation[0];
        result = toCheckedSuccess(tag);
      } else {
        result = toChecked(validation);
      }
    } catch (error) {
      // console.log(error.message);
      result = toChecked(validation);
    }
    return result;
  }

  const accumulateErrors = (
    accumulator: Checked[],
    checked: Checked
  ): Checked[] => {
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
