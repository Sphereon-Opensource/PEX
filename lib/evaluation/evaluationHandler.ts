import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClient } from './evaluationClient';

export interface EvaluationHandler {
  client: EvaluationClient;
  setNext(handler: EvaluationHandler): EvaluationHandler;
  getNext(): EvaluationHandler;
  hasNext(): boolean;
  getName(): string;
  handle(pd: PresentationDefinition, p: unknown): void;
}
