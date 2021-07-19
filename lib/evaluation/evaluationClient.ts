import { PresentationDefinition } from '@sphereon/pe-models';

import { FilterShouldExistIfPredicateEvaluationHandler } from './filterShouldExistIfPredicateEvaluationHandler';
import { PredicateRelatedFieldShouldBeBooleanEvaluationHandler } from './predicateRelatedFieldShouldBeBooleanEvaluationHandler';
import { UriEvaluationHandler } from './uriEvaluationHandler';

export class EvaluationClient {

  public runEvaluations(pd: PresentationDefinition, vp: any) {
    const filterShouldExistIfPredicateEvaluationHandler = new FilterShouldExistIfPredicateEvaluationHandler();
    const predicateEvaluationHandler = new PredicateRelatedFieldShouldBeBooleanEvaluationHandler();
    const uriEvaluation = new UriEvaluationHandler();

    uriEvaluation.setNext(filterShouldExistIfPredicateEvaluationHandler).setNext(predicateEvaluationHandler);

    uriEvaluation.handle(pd, vp);
  }
}