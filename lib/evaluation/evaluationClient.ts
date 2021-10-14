import { PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';
import { VerifiablePresentation } from '../verifiablePresentation';

import { HandlerCheckResult } from './handlerCheckResult';
import { EvaluationHandler } from './handlers/evaluationHandler';
import { InputDescriptorFilterEvaluationHandler } from './handlers/inputDescriptorFilterEvaluationHandler';
import { LimitDisclosureEvaluationHandler } from './handlers/limitDisclosureEvaluationHandler';
import { MarkForSubmissionEvaluationHandler } from './handlers/markForSubmissionEvaluationHandler';
import { PredicateRelatedFieldEvaluationHandler } from './handlers/predicateRelatedFieldEvaluationHandler';
import { SameSubjectEvaluationHandler } from './handlers/sameSubjectEvaluationHandler';
import { SubjectIsHolderEvaluationHandler } from './handlers/subjectIsHolderEvaluationHandler';
import { SubjectIsIssuerEvaluationHandler } from './handlers/subjectIsIssuerEvaluationHandler';
import { UriEvaluationHandler } from './handlers/uriEvaluationHandler';

export class EvaluationClient {
  constructor() {
    this._results = [];
    this._verifiablePresentation = null;
    this._did = null;
  }

  private failed_catched = {
    tag: 'root',
    status: Status.ERROR,
    message: 'unknown exception occurred: ',
    stacktrace: '',
  };

  private _results: HandlerCheckResult[];
  private _verifiablePresentation: VerifiablePresentation;
  private _did: string;

  public evaluate(pd: PresentationDefinition, vp: VerifiablePresentation): void {
    this._did = vp.holder;
    let currentHandler: EvaluationHandler = this.initEvaluationHandlers();
    currentHandler.handle(pd, vp);
    while (currentHandler.hasNext()) {
      currentHandler = currentHandler.getNext();
      try {
        currentHandler.handle(pd, vp);
      } catch (e) {
        this.failed_catched.message += e.message;
        this.failed_catched.stacktrace = e;
        throw this.failed_catched;
      }
    }
  }

  public get results(): HandlerCheckResult[] {
    return this._results;
  }

  public get did() {
    return this._did;
  }

  public set did(did: string) {
    this._did = did;
  }

  public get verifiablePresentation(): VerifiablePresentation {
    return this._verifiablePresentation;
  }

  public set verifiablePresentation(verifiablePresentation: VerifiablePresentation) {
    this._verifiablePresentation = verifiablePresentation;
  }

  private initEvaluationHandlers() {
    const uriEvaluation = new UriEvaluationHandler(this);

    uriEvaluation
      .setNext(new InputDescriptorFilterEvaluationHandler(this))
      .setNext(new PredicateRelatedFieldEvaluationHandler(this))
      .setNext(new MarkForSubmissionEvaluationHandler(this))
      .setNext(new LimitDisclosureEvaluationHandler(this))
      .setNext(new SubjectIsIssuerEvaluationHandler(this))
      .setNext(new SubjectIsHolderEvaluationHandler(this))
      .setNext(new SameSubjectEvaluationHandler(this));

    return uriEvaluation;
  }
}
