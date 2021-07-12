import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationBundler } from './bundlers';
import { evaluate, Evaluation } from './core';

export class Evaluator {
  bundler: EvaluationBundler<any, PresentationDefinition>;
  target: any;
}

export class EvaluationEngine {
  //TODO change this Object to PresentationSubmissionWrapper
  evaluate(evaluators: Evaluator[]) {
    let evaluations: Evaluation<any, PresentationDefinition>[] = [];

    for (const evaluator of evaluators) {
      evaluations = evaluations.concat(evaluator.bundler.getEvaluations(evaluator.target.d, evaluator.target.p));
    }

    return evaluate(evaluations);
  }
}
