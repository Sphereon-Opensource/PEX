import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { EvaluationHandler } from './evaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';
import { InputDescriptorFilterEvaluationHandler } from './inputDescriptorFilterEvaluationHandler';
import { LimitDataSubmissionsToSpecifiedEntriesEvaluationHandler } from './limitDataSubmissionsToSpecifiedEntriesEvaluationHandler';
import { MarkForSubmissionEvaluationHandler } from './markForSumissionEvaluationHandler';
import { PredicateRelatedFieldEvaluationHandler } from './predicateRelatedFieldEvaluationHandler';
import { UriEvaluationHandler } from './uriEvaluationHandler';

export class EvaluationClient {
  constructor() {
    this._results = [];
    this._presentationSubmission = { id: '', definition_id: '', descriptor_map: [] };
  }

  private failed_catched: Checked = {
    tag: 'root',
    status: Status.ERROR,
    message: 'unknown exception occurred: ',
  };

  private _results: HandlerCheckResult[];
  private _presentationSubmission: PresentationSubmission;

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
    return this._results;
  }

  get results(): HandlerCheckResult[] {
    return this._results;
  }

  get presentationSubmission(): PresentationSubmission {
    return this._presentationSubmission;
  }

  private initEvaluationHandlers() {
    const uriEvaluation = new UriEvaluationHandler(this);
    const inputDescriptorFilterEvaluationHandler = new InputDescriptorFilterEvaluationHandler(this);
    const predicateEvaluationHandler = new PredicateRelatedFieldEvaluationHandler(this);
    const markForSubmissionEvaluation = new MarkForSubmissionEvaluationHandler(this);
    const limitDataSubmissionsToSpecifiedEntriesEvaluationHandler = new LimitDataSubmissionsToSpecifiedEntriesEvaluationHandler(
      this
    );
    uriEvaluation
      .setNext(inputDescriptorFilterEvaluationHandler)
      .setNext(predicateEvaluationHandler)
      .setNext(markForSubmissionEvaluation)
      .setNext(limitDataSubmissionsToSpecifiedEntriesEvaluationHandler);

    return uriEvaluation;
  }
}
