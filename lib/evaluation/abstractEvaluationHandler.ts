import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked } from '../ConstraintUtils';

import { EvaluationHandler } from './evaluationHandler';

export abstract class AbstractEvaluationHandler implements EvaluationHandler {
  private nextHandler: EvaluationHandler;

  public setNext(handler: EvaluationHandler): EvaluationHandler {
    this.nextHandler = handler;
    return handler;
  }

  public handle(d: PresentationDefinition, p: unknown, result: Map<InputDescriptor, Map<unknown, Checked>>): void {
    if (this.nextHandler) {
      return this.nextHandler.handle(d, p, result);
    }
  }
}
