import { EvaluationBundler } from './bundlers';

import { evaluate, Evaluation } from './index';

export class Evaluator {
  bundler: EvaluationBundler<unknown>;
  target: any;
}

export class EvaluationEngine {
  evaluate(evaluators: Evaluator[]) {
    let evaluations: Evaluation<any>[] = [];

    for (const evaluator of evaluators) {
      evaluations = evaluations.concat(evaluator.bundler.getEvaluations(evaluator.target));
    }

    return evaluate(evaluations);
  }
}
