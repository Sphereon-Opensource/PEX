import { EvaluationBundler } from './bundlers';
import { evaluate, Evaluation } from './core';

export class Evaluator {
  bundler: EvaluationBundler<unknown, unknown>;
  target: { d: unknown; p: unknown };
}

export class EvaluationEngine {
  //TODO change this Object to PresentationSubmissionWrapper
  evaluate(evaluators: Evaluator[]) {
    let evaluations: Evaluation<unknown, unknown>[] = [];

    for (const evaluator of evaluators) {
      evaluations = evaluations.concat(evaluator.bundler.getEvaluations(evaluator.target.d, evaluator.target.p));
    }

    return evaluate(evaluations);
  }
}
