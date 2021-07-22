import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked } from '../ConstraintUtils';

import { EvaluationResultHolder } from './evaluationResultHolder';
import { FilterShouldExistIfPredicateEvaluationHandler } from './filterShouldExistIfPredicateEvaluationHandler';
import { PredicateRelatedFieldShouldBeBooleanEvaluationHandler } from './predicateRelatedFieldShouldBeBooleanEvaluationHandler';
import { UriEvaluationHandler } from './uriEvaluationHandler';

export class EvaluationClient {
  public runEvaluations(pd: PresentationDefinition, vp: unknown): Map<InputDescriptor, Map<unknown, Checked>> {
    const evaluationResult = new EvaluationResultHolder();
    const vcMap = evaluationResult.initializeVCMap(pd, vp);
    const filterShouldExistIfPredicateEvaluationHandler = new FilterShouldExistIfPredicateEvaluationHandler();
    const predicateEvaluationHandler = new PredicateRelatedFieldShouldBeBooleanEvaluationHandler();
    const uriEvaluation = new UriEvaluationHandler();

    uriEvaluation.setNext(filterShouldExistIfPredicateEvaluationHandler).setNext(predicateEvaluationHandler);

    uriEvaluation.handle(pd, vp, vcMap);
    return vcMap;
  }
}
