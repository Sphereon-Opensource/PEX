import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { HandlerCheckResult } from './handlerCheckResult';
import { EvaluationHandler } from './evaluationHandler';
import { EvaluationResultHolder } from './evaluationResultHolder';
import { FilterShouldExistIfPredicateEvaluationHandler } from './filterShouldExistIfPredicateEvaluationHandler';
import { PredicateRelatedFieldEvaluationHandler } from './predicateRelatedFieldEvaluationHandler';
import { UriEvaluationHandler } from './uriEvaluationHandler';
import { InputDescriptorFilterEvaluationHandler } from './inputDescriptorFilterEvaluationHandler';

export class EvaluationClient {
  private failed_catched: Checked = {
    tag: 'root',
    status: Status.ERROR,
    message: 'unknown exception occurred: ',
  };

  public evaluate(pd: PresentationDefinition, vp: unknown): Map<InputDescriptor, Map<unknown, Checked>> {
    const evaluationResult = new EvaluationResultHolder();
    const vcMap = evaluationResult.initializeVCMap(pd, vp);

    const results: HandlerCheckResult[] = [];
    let currentHandler: EvaluationHandler = this.initEvaluationHandlers();
    results.push(...currentHandler.handle(pd, vp));
    while (currentHandler.hasNext()) {
      currentHandler = currentHandler.getNext();
      try {
        results.push(...currentHandler.handle(pd, vp));
      } catch (e) {
        this.failed_catched.message += e.message;
        throw this.failed_catched;
      }
    }
    return vcMap;
  }

  private initEvaluationHandlers() {
    const uriEvaluation = new UriEvaluationHandler();
    const filterShouldExistIfPredicateEvaluationHandler = new FilterShouldExistIfPredicateEvaluationHandler();
    const predicateEvaluationHandler = new PredicateRelatedFieldEvaluationHandler();
    const filterEvaluationHandler = new InputDescriptorFilterEvaluationHandler();

    uriEvaluation
    .setNext(filterShouldExistIfPredicateEvaluationHandler)
    .setNext(predicateEvaluationHandler)
    .setNext(filterEvaluationHandler);

    return uriEvaluation;
  }
}