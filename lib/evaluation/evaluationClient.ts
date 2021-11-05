import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';
import { VerifiableCredential, VerifiablePresentation } from '../verifiablePresentation';

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
    this._verifiableCredential = [];
    this._presentationSubmission = {};
    this._did = '';
  }

  private failed_catched = {
    tag: 'root',
    status: Status.ERROR,
    message: 'unknown exception occurred: ',
    stacktrace: '',
  };

  private _results: HandlerCheckResult[];
  private _verifiableCredential: Partial<VerifiableCredential>[];
  private _presentationSubmission: Partial<PresentationSubmission>;
  private _did: string;

  public evaluate(pd: PresentationDefinition, vp: Partial<VerifiablePresentation>): void {
    this._did = (vp as VerifiablePresentation).holder;
    let currentHandler: EvaluationHandler | undefined = this.initEvaluationHandlers();
    currentHandler?.handle(pd, vp?.verifiableCredential as VerifiableCredential[]);
    while (currentHandler?.hasNext()) {
      currentHandler = currentHandler.getNext();
      try {
        currentHandler?.handle(pd, vp?.verifiableCredential as VerifiableCredential[]);
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

  public get presentationSubmission(): PresentationSubmission {
    return this._presentationSubmission as PresentationSubmission;
  }

  public set presentationSubmission(presentationSubmission: Partial<PresentationSubmission>) {
    this._presentationSubmission = presentationSubmission;
  }

  public get verifiableCredential(): VerifiableCredential[] {
    return this._verifiableCredential as VerifiableCredential[];
  }

  public set verifiableCredential(verifiableCredential: Partial<VerifiableCredential>[]) {
    this._verifiableCredential = verifiableCredential;
  }

  private initEvaluationHandlers() {
    const uriEvaluation = new UriEvaluationHandler(this);

    uriEvaluation
      .setNext(new InputDescriptorFilterEvaluationHandler(this))
      .setNext(new PredicateRelatedFieldEvaluationHandler(this))
      .setNext(new LimitDisclosureEvaluationHandler(this))
      .setNext(new SubjectIsIssuerEvaluationHandler(this))
      .setNext(new SubjectIsHolderEvaluationHandler(this))
      .setNext(new SameSubjectEvaluationHandler(this))
      .setNext(new MarkForSubmissionEvaluationHandler(this));

    return uriEvaluation;
  }
}
