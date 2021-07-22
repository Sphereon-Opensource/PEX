import { PresentationDefinition } from '@sphereon/pe-models';

import { HandlerCheckResult } from './HandlerCheckResult';

export interface EvaluationHandler {
  setNext(handler: EvaluationHandler): EvaluationHandler;
  getNext(): EvaluationHandler;
  hasNext(): boolean;
  getName(): string;
  handle(pd: PresentationDefinition, p: unknown): HandlerCheckResult[];
}
