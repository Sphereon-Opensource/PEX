import { PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { EvaluationHandler } from './evaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';
import { InputDescriptorFilterEvaluationHandler } from './inputDescriptorFilterEvaluationHandler';
import { MarkForSubmissionEvaluationHandler } from './markForSumissionEvaluationHandler';
import { PredicateRelatedFieldEvaluationHandler } from './predicateRelatedFieldEvaluationHandler';
import { UriEvaluationHandler } from './uriEvaluationHandler';

export class EvaluationClient {
  private failed_catched: Checked = {
    tag: 'root',
    status: Status.ERROR,
    message: 'unknown exception occurred: ',
  };

  public evaluate(pd: PresentationDefinition, vp: unknown): HandlerCheckResult[] {
    let currentHandler: EvaluationHandler = this.initEvaluationHandlers();
    currentHandler.handle(pd, vp);
    while (currentHandler.hasNext()) {
      currentHandler = currentHandler.getNext();
      try {
        currentHandler.handle(pd, vp);
      } catch (e) {
        this.failed_catched.message += e.message;
        throw this.failed_catched;
      }
    }
    return currentHandler.results;
  }

  private initEvaluationHandlers() {
    const uriEvaluation = new UriEvaluationHandler();
    const inputDescriptorFilterEvaluationHandler = new InputDescriptorFilterEvaluationHandler();
    const predicateEvaluationHandler = new PredicateRelatedFieldEvaluationHandler();
    const markForSubmissionEvaluation = new MarkForSubmissionEvaluationHandler();
    uriEvaluation
      .setNext(inputDescriptorFilterEvaluationHandler)
      .setNext(predicateEvaluationHandler)
      .setNext(markForSubmissionEvaluation);

    return uriEvaluation;
  }
}
