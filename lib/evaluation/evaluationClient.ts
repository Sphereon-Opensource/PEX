import { Format, PresentationSubmission } from '@sphereon/pex-models';
import { IProofType, WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Status } from '../ConstraintUtils';
import { IInternalPresentationDefinition } from '../types';
import PexMessages from '../types/Messages';
import { filterToRestrictedDIDs, uniformDIDMethods } from '../utils';

import { HandlerCheckResult } from './core';
import {
  DIDRestrictionEvaluationHandler,
  EvaluationHandler,
  FormatRestrictionEvaluationHandler,
  InputDescriptorFilterEvaluationHandler,
  LimitDisclosureEvaluationHandler,
  MarkForSubmissionEvaluationHandler,
  PredicateRelatedFieldEvaluationHandler,
  SameSubjectEvaluationHandler,
  SubjectIsHolderEvaluationHandler,
  SubjectIsIssuerEvaluationHandler,
  UriEvaluationHandler,
} from './handlers';

const DEFAULT_LIMIT_DISCLOSURE_TYPES = [IProofType.BbsBlsSignatureProof2020];

export class EvaluationClient {
  constructor() {
    this._results = [];
    this._wrappedVcs = [];
    this._presentationSubmission = {};
    this._dids = [];
    this._limitDisclosureSignatureSuites = DEFAULT_LIMIT_DISCLOSURE_TYPES;
    this._restrictToDIDMethods = [];
    this._generatePresentationSubmission = true;
  }

  private failed_catched = {
    tag: 'root',
    status: Status.ERROR,
    message: PexMessages.UNKNOWN_EXCEPTION as string,
    stacktrace: '',
  };

  private _results: HandlerCheckResult[];
  private _wrappedVcs: Partial<WrappedVerifiableCredential>[];
  private _presentationSubmission: Partial<PresentationSubmission>;
  // private _requirePresentationSubmission: boolean;
  private _dids: string[];
  private _limitDisclosureSignatureSuites: string[] | undefined;
  private _restrictToFormats: Format | undefined;
  private _restrictToDIDMethods: string[];

  private _generatePresentationSubmission: boolean;

  public evaluate(
    pd: IInternalPresentationDefinition,
    wvcs: WrappedVerifiableCredential[],
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
      presentationSubmission?: PresentationSubmission;
      generatePresentationSubmission?: boolean;
    },
  ): void {
    this._restrictToDIDMethods = opts?.restrictToDIDMethods ? uniformDIDMethods(opts?.restrictToDIDMethods) : [];
    this._dids = opts?.holderDIDs ? filterToRestrictedDIDs(opts.holderDIDs, this._restrictToDIDMethods) : [];
    this._limitDisclosureSignatureSuites = opts?.limitDisclosureSignatureSuites;
    this._restrictToFormats = opts?.restrictToFormats;
    this._generatePresentationSubmission = opts?.generatePresentationSubmission !== undefined ? opts.generatePresentationSubmission : true;
    if (opts?.presentationSubmission) {
      this._presentationSubmission = opts.presentationSubmission;
      // this._requirePresentationSubmission = true;
    }
    let currentHandler: EvaluationHandler | undefined = this.initEvaluationHandlers();
    currentHandler?.handle(pd, wvcs);
    while (currentHandler?.hasNext()) {
      currentHandler = currentHandler.getNext();
      try {
        currentHandler?.handle(pd, wvcs);
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

  public assertPresentationSubmission() {
    if (!this.generatePresentationSubmission && (!this.presentationSubmission || Object.keys(this.presentationSubmission).length === 0)) {
      throw Error('No presentation submission present, but required option was set');
    }
  }

  get generatePresentationSubmission(): boolean {
    return this._generatePresentationSubmission;
  }

  set generatePresentationSubmission(value: boolean) {
    this._generatePresentationSubmission = value;
  }

  public get presentationSubmission(): PresentationSubmission {
    return this._presentationSubmission as PresentationSubmission;
  }

  public set presentationSubmission(presentationSubmission: Partial<PresentationSubmission>) {
    this._presentationSubmission = presentationSubmission;
  }

  public get wrappedVcs(): WrappedVerifiableCredential[] {
    return this._wrappedVcs as WrappedVerifiableCredential[];
  }

  public set wrappedVcs(wrappedVcs: WrappedVerifiableCredential[]) {
    this._wrappedVcs = wrappedVcs;
  }

  public get limitDisclosureSignatureSuites() {
    return this._limitDisclosureSignatureSuites || DEFAULT_LIMIT_DISCLOSURE_TYPES;
  }

  public set limitDisclosureSignatureSuites(limitDisclosureSignatureSuites: string[]) {
    this._limitDisclosureSignatureSuites = limitDisclosureSignatureSuites;
  }

  get restrictToDIDMethods(): string[] {
    return this._restrictToDIDMethods;
  }

  set restrictToDIDMethods(value: string[]) {
    this._restrictToDIDMethods = uniformDIDMethods(value);
  }

  public hasRestrictToDIDMethods(): boolean {
    return this.restrictToDIDMethods && this.restrictToDIDMethods.length > 0;
  }

  get restrictToFormats(): Format | undefined {
    return this._restrictToFormats;
  }

  set restrictToFormats(value: Format | undefined) {
    this._restrictToFormats = value;
  }
  private initEvaluationHandlers() {
    const uriEvaluation = new UriEvaluationHandler(this);
    uriEvaluation
      .setNext(new DIDRestrictionEvaluationHandler(this))
      .setNext(new FormatRestrictionEvaluationHandler(this))
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
