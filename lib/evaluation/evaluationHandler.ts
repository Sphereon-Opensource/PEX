import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClient } from './evaluationClient';
import { HandlerCheckResult } from './handlerCheckResult';

export interface EvaluationHandler {
  client: EvaluationClient;
  readonly results: HandlerCheckResult[];
  readonly verifiablePresentation: unknown;
  setNext(handler: EvaluationHandler): EvaluationHandler;
  getNext(): EvaluationHandler;
  hasNext(): boolean;
  getName(): string;
  handle(pd: PresentationDefinition, p: unknown): void;
}
