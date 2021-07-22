import { PresentationDefinition } from '@sphereon/pe-models';

import { HandlerCheckResult } from './handlerCheckResult';

import { EvaluationHandler } from './evaluationHandler';

export abstract class AbstractEvaluationHandler implements EvaluationHandler {
  private nextHandler: EvaluationHandler;

  public setNext(handler: EvaluationHandler): EvaluationHandler {
    this.nextHandler = handler;
    return handler;
  }

  public abstract getName(): string;

  public getNext(): EvaluationHandler {
    return this.nextHandler;
  }

  public hasNext(): boolean {
    return this.nextHandler != undefined;
  }

  public handle(d: PresentationDefinition, p: unknown): HandlerCheckResult[] {
    if (this.nextHandler) {
      return this.nextHandler.handle(d, p);
    }
    return [];
  }
}
