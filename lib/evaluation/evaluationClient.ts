import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';
import { VerifiableCredential } from '../verifiablePresentation';
import { ProofType } from '../verifiablePresentation/SSI.types';

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

const DEFAULT_LIMIT_DISCLOSURE_TYPES = [ProofType.BbsBlsSignatureProof2020];

export class EvaluationClient {
  constructor() {
    this._results = [];
    this._verifiableCredential = [];
    this._presentationSubmission = {};
    this._dids = [];
    this._limitDisclosureSignatureSuites = DEFAULT_LIMIT_DISCLOSURE_TYPES;
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
  private _dids: string[];
  private _limitDisclosureSignatureSuites: string[] | undefined;

  public evaluate(
    pd: PresentationDefinition,
    vcs: VerifiableCredential[],
    holderDids: string[],
    limitDisclosureSignatureSuites?: string[]
  ): void {
    this._dids = holderDids;
    this._limitDisclosureSignatureSuites = limitDisclosureSignatureSuites;
    let currentHandler: EvaluationHandler | undefined = this.initEvaluationHandlers();
    currentHandler?.handle(pd, vcs);
    while (currentHandler?.hasNext()) {
      currentHandler = currentHandler.getNext();
      try {
        currentHandler?.handle(pd, vcs);
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

  public get dids() {
    return this._dids;
  }

  public set dids(dids: string[]) {
    this._dids = dids;
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

  public set verifiableCredential(verifiableCredential: VerifiableCredential[]) {
    this._verifiableCredential = verifiableCredential;
  }

  public get limitDisclosureSignatureSuites() {
    return this._limitDisclosureSignatureSuites || DEFAULT_LIMIT_DISCLOSURE_TYPES;
  }

  public set limitDisclosureSignatureSuites(limitDisclosureSignatureSuites: string[]) {
    this._limitDisclosureSignatureSuites = limitDisclosureSignatureSuites;
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
