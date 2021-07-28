import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { HandlerCheckResult } from './handlerCheckResult';

export interface EvaluationHandler {
  results: HandlerCheckResult[];
  presentationSubmission: PresentationSubmission;
  setNext(handler: EvaluationHandler): EvaluationHandler;
  getNext(): EvaluationHandler;
  hasNext(): boolean;
  getName(): string;
  handle(pd: PresentationDefinition, p: unknown): void;
}
