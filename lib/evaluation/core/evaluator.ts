import { Checked, hasErrors, Status } from '../../ConstraintUtils';

import { Evaluated } from './evaluated';

export type EvaluationPredicate<D, P> = (d: D, p: P) => boolean;

export class Evaluation<D, P> {
  tag: string;
  target: { d: D; p: P };
  predicate: EvaluationPredicate<D, P>;
  message: string;
  status?: Status;
}

export type EvaluateAll = <D, P>(evaluations: Evaluation<D, P>[]) => Evaluated;

export const evaluate: EvaluateAll = <D, P>(evaluations: Evaluation<D, P>[]): Evaluated => {
  const evaluateResults: Checked[] = evaluations.map((evaluation) => mapper(evaluation));

  function toChecked(evaluation: Evaluation<D, P>) {
    return new Checked(evaluation.tag, Status.ERROR, evaluation.message);
  }

  function toCheckedSuccess(tag: string) {
    return new Checked(tag, Status.INFO, 'ok');
  }

  function mapper(evaluation: Evaluation<D, P>): Checked {
    let result;

    try {
      if (evaluation.predicate(evaluation.target.d, evaluation.target.p)) {
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
