import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { EvaluationHandler } from './evaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

export abstract class AbstractEvaluationHandler implements EvaluationHandler {
  private nextHandler: EvaluationHandler;
  private _results: HandlerCheckResult[];
  private _presentationSubmission: PresentationSubmission;

  public setNext(handler: EvaluationHandler): EvaluationHandler {
    if (!this.results || !this.presentationSubmission) {
      this._results = [];
      this.presentationSubmission = { id: '', definition_id: '', descriptor_map: [] };
    }
    this.nextHandler = handler;
    handler.results = this.results;
    handler.presentationSubmission = this.presentationSubmission;
    return handler;
  }

  public abstract getName(): string;

  public getNext(): EvaluationHandler {
    return this.nextHandler;
  }

  public hasNext(): boolean {
    return this.nextHandler != undefined;
  }

  public get results(): HandlerCheckResult[] {
    return this._results;
  }

  public set results(results: HandlerCheckResult[]) {
    this._results = results;
  }

  public get presentationSubmission() {
    return this._presentationSubmission;
  }

  public set presentationSubmission(presentationSubmission: PresentationSubmission) {
    this._presentationSubmission = presentationSubmission;
  }

  public abstract handle(d: PresentationDefinition, p: unknown): void;
}
