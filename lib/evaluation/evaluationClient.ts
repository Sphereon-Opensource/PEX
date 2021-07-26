import { PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { EvaluationHandler } from './evaluationHandler';
import { FilterShouldExistIfPredicateExistsEvaluationHandler } from './filterShouldExistIfPredicateExistsEvaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';
import { InputDescriptorFilterEvaluationHandler } from './inputDescriptorFilterEvaluationHandler';
import { PredicateRelatedFieldEvaluationHandler } from './predicateRelatedFieldEvaluationHandler';
import { UriEvaluationHandler } from './uriEvaluationHandler';

export class EvaluationClient {
  private failed_catched: Checked = {
    tag: 'root',
    status: Status.ERROR,
    message: 'unknown exception occurred: ',
  };

  public evaluate(pd: PresentationDefinition, vp: unknown): HandlerCheckResult[] {
    const results: HandlerCheckResult[] = [];
    let currentHandler: EvaluationHandler = this.initEvaluationHandlers();
    currentHandler.handle(pd, vp, results);
    while (currentHandler.hasNext()) {
      currentHandler = currentHandler.getNext();
      try {
        currentHandler.handle(pd, vp, results);
      } catch (e) {
        this.failed_catched.message += e.message;
        throw this.failed_catched;
      }
    }
    return results;
  }

  private initEvaluationHandlers() {
    const uriEvaluation = new UriEvaluationHandler();
    const filterShouldExistIfPredicateEvaluationHandler = new FilterShouldExistIfPredicateExistsEvaluationHandler();
    const inputDescriptorFilterEvaluationHandler = new InputDescriptorFilterEvaluationHandler();
    const predicateEvaluationHandler = new PredicateRelatedFieldEvaluationHandler();
    const filterEvaluationHandler = new InputDescriptorFilterEvaluationHandler();
    uriEvaluation
      .setNext(filterShouldExistIfPredicateEvaluationHandler)
      .setNext(inputDescriptorFilterEvaluationHandler)
      .setNext(predicateEvaluationHandler)
      .setNext(filterEvaluationHandler);

    return uriEvaluation;
  }
}
