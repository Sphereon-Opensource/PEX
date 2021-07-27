import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationHandler } from './evaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

export abstract class AbstractEvaluationHandler implements EvaluationHandler {
  private nextHandler: EvaluationHandler;
  protected results: HandlerCheckResult[];
  protected presentationSubmission: unknown;

  public setNext(handler: EvaluationHandler): EvaluationHandler {
    if (!this.results || !this.presentationSubmission) {
      this.results = [];
      this.presentationSubmission = {};
    }
    this.nextHandler = handler;
    handler.setResults(this.results);
    handler.setPresentationSubmission(this.presentationSubmission);
    return handler;
  }

  public abstract getName(): string;

  public getNext(): EvaluationHandler {
    return this.nextHandler;
  }

  public hasNext(): boolean {
    return this.nextHandler != undefined;
  }

  getResults(): HandlerCheckResult[] {
    return this.results;
  }

  public setResults(results: HandlerCheckResult[]): void {
    this.results = results;
  }

  public setPresentationSubmission(presentationSubmission: unknown): void {
    this.presentationSubmission = presentationSubmission;
  }

  public abstract handle(d: PresentationDefinition, p: unknown): void;
}
