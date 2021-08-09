import { PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { EvaluationHandler } from './evaluationHandler';
import { EvaluationResults } from './evaluationResults';
import { HandlerCheckResult } from './handlerCheckResult';
import { InputDescriptorFilterEvaluationHandler } from './inputDescriptorFilterEvaluationHandler';
import { LimitDisclosureEvaluationHandler } from './limitDisclosureEvaluationHandler';
import { MarkForSubmissionEvaluationHandler } from './markForSubmissionEvaluationHandler';
import { PredicateRelatedFieldEvaluationHandler } from './predicateRelatedFieldEvaluationHandler';
import { SubjectIsIssuerEvaluationHandler } from './subjectIsIssuerEvaluationHandler';
import { UriEvaluationHandler } from './uriEvaluationHandler';

export class EvaluationClient {
  constructor() {
    this._results = [];
    this._verifiablePresentation = {};
  }

  private failed_catched: Checked = {
    tag: 'root',
    status: Status.ERROR,
    message: 'unknown exception occurred: ',
  };

  private _results: HandlerCheckResult[];
  private _verifiablePresentation: unknown;

  public evaluate(pd: PresentationDefinition, vp: unknown): HandlerCheckResult[] {
    let currentHandler: EvaluationHandler = this.initEvaluationHandlers();
    try {
      currentHandler.handle(pd, vp);
      while (currentHandler.hasNext()) {
        currentHandler = currentHandler.getNext();
        currentHandler.handle(pd, vp);
      }
    } catch (e) {
      this.failed_catched.message += e.message;
      throw this.failed_catched;
    }
    return this._results;
  }

  public evaluateWrapper(pd: PresentationDefinition, vp: unknown): EvaluationResults {
    this.evaluate(pd, vp);
    const result: any = {};
    result.warnings = this.results.filter((result) => result.status === Status.WARN).map((x) => JSON.stringify(x));
    result.errors = this.results
      .filter((result) => result.status === Status.ERROR)
      .map((x) => {
        return {
          name: x.evaluator,
          message: `${x.message}: ${x.input_descriptor_path}: ${x.verifiable_credential_path}`,
        };
      });
    if (this._verifiablePresentation['presentationSubmission']['descriptor_map'].length) {
      result.value = this._verifiablePresentation['presentationSubmission'];
    }
    return result;
  }

  public get results(): HandlerCheckResult[] {
    return this._results;
  }

  public get verifiablePresentation(): any {
    return this._verifiablePresentation;
  }

  private initEvaluationHandlers() {
    const uriEvaluation = new UriEvaluationHandler(this);
    const inputDescriptorFilterEvaluationHandler = new InputDescriptorFilterEvaluationHandler(this);
    const predicateEvaluationHandler = new PredicateRelatedFieldEvaluationHandler(this);
    const markForSubmissionEvaluation = new MarkForSubmissionEvaluationHandler(this);
    const limitDisclosureEvaluationHandler = new LimitDisclosureEvaluationHandler(this);
    const subjectIsIssuerEvaluationHandler = new SubjectIsIssuerEvaluationHandler(this);
    uriEvaluation
      .setNext(inputDescriptorFilterEvaluationHandler)
      .setNext(predicateEvaluationHandler)
      .setNext(markForSubmissionEvaluation)
      .setNext(limitDisclosureEvaluationHandler)
      .setNext(subjectIsIssuerEvaluationHandler);

    return uriEvaluation;
  }
}
