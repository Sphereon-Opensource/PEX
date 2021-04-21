import { Invalid, InvalidOr, Validated } from './validationResults';
import { areInvalid } from './validationUtils';

export type Predicate<T> = (t: T) => boolean;
export type Validation<T> = [Predicate<T>, string];
export type ValidateAll = <T>(
  t: T,
  validations: Validation<T>[]
) => Validated<T>;

export const validate: ValidateAll = <T>(
  validatable,
  validations
): Validated<T> => {
  const validateResults: InvalidOr<T>[] = validations.map((validation) =>
    mapper(validation)
  );

  function mapper(validation): InvalidOr<T> {
    let result;
    try {
      if (validation[0](validatable)) {
        result = validatable;
      } else {
        result = new Invalid(validation[1]);
      }
    } catch (error) {
      result = new Invalid(validation[1]);
    }
    return result;
  }

  const accumulateErrors = (
    accumulator: Invalid[],
    invalidOrT: InvalidOr<T>
  ): Invalid[] => {
    if (invalidOrT instanceof Invalid) {
      accumulator.push(invalidOrT);
    }
    return accumulator;
  };

  const errors: Invalid[] = validateResults.reduce(accumulateErrors, []);

  return areInvalid(errors) ? errors : validatable;
};
