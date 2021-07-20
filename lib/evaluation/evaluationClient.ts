import { PresentationDefinition } from '@sphereon/pe-models';

import { FilterShouldExistIfPredicateEvaluationHandler } from './filterShouldExistIfPredicateEvaluationHandler';
import { InputDescriptorFilterEvaluationHandler } from './inputDescriptorFilterEvaluationHandler';
import { PredicateRelatedFieldShouldBeBooleanEvaluationHandler } from './predicateRelatedFieldShouldBeBooleanEvaluationHandler';
import { UriEvaluationHandler } from './uriEvaluationHandler';

export class EvaluationClient {

  public runEvaluations(pd: PresentationDefinition, vp: any) {
    const filterShouldExistIfPredicateEvaluationHandler = new FilterShouldExistIfPredicateEvaluationHandler();
    const predicateEvaluationHandler = new PredicateRelatedFieldShouldBeBooleanEvaluationHandler();
    const uriEvaluation = new UriEvaluationHandler();
    const filterEvaluationHandler = new InputDescriptorFilterEvaluationHandler();

    uriEvaluation
    .setNext(filterShouldExistIfPredicateEvaluationHandler)
    .setNext(predicateEvaluationHandler)
    .setNext(filterEvaluationHandler);

    uriEvaluation.handle(pd, vp);
  }
}