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
    this._verifiablePresentation = {
      '@context': [],
      type: '',
      holder: '',
      verifiableCredential: [],
      presentation_submission: { id: '', definition_id: '', descriptor_map: [] },
      proof: { proofPurpose: '', type: '', jws: '', created: '', verificationMethod: '' },
    };
    this._did = '';
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
      } catch (e: any) {
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
