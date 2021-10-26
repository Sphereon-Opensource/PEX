import { PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';
import { VerifiablePresentation } from '../verifiablePresentation';

import { HandlerCheckResult } from './handlerCheckResult';
import {
  EvaluationHandler,
  InputDescriptorFilterEvaluationHandler,
  LimitDisclosureEvaluationHandler,
  MarkForSubmissionEvaluationHandler,
  PredicateRelatedFieldEvaluationHandler,
  SameSubjectEvaluationHandler,
  SubjectIsHolderEvaluationHandler,
  SubjectIsIssuerEvaluationHandler,
  UriEvaluationHandler,
} from './handlers';

export class EvaluationClient {
  constructor() {
    this._results = [];
    this._verifiablePresentation = {};
    this._did = '';
  }

  private failed_catched = {
    tag: 'root',
    status: Status.ERROR,
    message: 'unknown exception occurred: ',
    stacktrace: '',
  };

  private _results: HandlerCheckResult[];
  private _verifiablePresentation: Partial<VerifiablePresentation>;
  private _did: string;

  public evaluate(pd: PresentationDefinition, vp: Partial<VerifiablePresentation>): void {
    this._did = (vp as VerifiablePresentation).holder;
    let currentHandler: EvaluationHandler | undefined = this.initEvaluationHandlers();
    currentHandler.handle(pd, vp as VerifiablePresentation);
    while (currentHandler?.hasNext()) {
      currentHandler = currentHandler.getNext();
      try {
        currentHandler?.handle(pd, vp as VerifiablePresentation);
      } catch (e) {
        this.failed_catched.message += (e as Error).message;
        this.failed_catched.stacktrace = e as string;
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
    return this._verifiablePresentation as VerifiablePresentation;
  }

  public set verifiablePresentation(verifiablePresentation: Partial<VerifiablePresentation>) {
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
