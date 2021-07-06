// 4.1.1 Omission of the limit_disclosure property indicates the processing entity MAY submit a response that contains more than the data described in the fields array.
import {Checked, Status, hasErrors, Predicate} from '../ConstraintUtils';
import { Evaluated } from './core/evaluated';

export class Evaluation<T> {
    tag: string;
    target: T;
    predicate: Predicate<T>;
    message: string;
    status?: Status;
}
export type ValidateAll = <T>(evaluations: Evaluation<T>[]) => Evaluated;

export const validate: ValidateAll = <T>(evaluations: Evaluation<T>[]): Evaluated => {
    const evaluateResults: Checked[] = evaluations.map((evaluation) => mapper(evaluation));

    function toChecked(evaluation: Evaluation<T>) {
        return new Checked(evaluation.tag, Status.ERROR, evaluation.message);
    }

    function toCheckedSuccess(tag: string) {
        return new Checked(tag, Status.INFO, 'ok');
    }

    function mapper(evaluation: Evaluation<T>): Checked {
        let result;

        try {
            if (evaluation.predicate(evaluation.target)) {
                result = toCheckedSuccess(evaluation.tag);
            } else {
                result = toChecked(evaluation);
            }
        } catch (error) {
            // console.log(error.message);
            result = toChecked(evaluation);
        }
        return result;
    }

    const accumulateErrors = (accumulator: Checked[], checked: Checked): Checked[] => {
        if (checked.status !== Status.INFO) {
            accumulator.push(checked);
        }
        return accumulator;
    };

    const evaluated: Checked[] = evaluateResults.reduce(accumulateErrors, []);

    if (hasErrors(evaluated)) {
        return evaluated as Evaluated;
    } else {
        return [toCheckedSuccess('root')];
    }
};

