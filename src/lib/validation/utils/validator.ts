import { Invalid, InvalidOr, Validated } from './errors';
import { areInvalid } from './validationUtils';

export type Validation<T> = (t: T) => InvalidOr<T>;
export type ValidateAll = <T>(validations: Validation<T>[], t: T) => Validated<T>;

export const validate: ValidateAll = <T>(validations, validatable): Validated<T> => {

    const validateResults: InvalidOr<T>[] = validations.map(validation => mapper(validation));

    function mapper(validation) : InvalidOr<T> {
        let result;
        try {
            result = validation(validatable);
        } catch (error) {
            result = new Invalid(error.message);
        }
        return result;
    }

    const accumulateErrors = (accumulator: Invalid[], invalidOrT: InvalidOr<T>): Invalid[] => {
        if (invalidOrT instanceof Invalid) {
            accumulator.push(invalidOrT);
        }
        return accumulator;
    };

    const errors: Invalid[] = validateResults.reduce(accumulateErrors, []);

    return areInvalid(errors) ? errors : validatable;
};
