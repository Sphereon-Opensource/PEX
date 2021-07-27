import { PresentationDefinition } from '@sphereon/pe-models';

import { HandlerCheckResult } from './handlerCheckResult';

export interface EvaluationHandler {
  setNext(handler: EvaluationHandler): EvaluationHandler;
  getNext(): EvaluationHandler;
  hasNext(): boolean;
  getName(): string;
  setResults(results: HandlerCheckResult[]): void;
  getResults(): HandlerCheckResult[];
  setPresentationSubmission(presentationSubmission: unknown): void;
  handle(pd: PresentationDefinition, p: unknown): void;
}
