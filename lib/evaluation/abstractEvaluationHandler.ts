import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationHandler } from './evaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

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

  public handle(d: PresentationDefinition, p: unknown, results: HandlerCheckResult[]): void {
    if (this.nextHandler) {
      this.nextHandler.handle(d, p, results);
    }
  }
}
