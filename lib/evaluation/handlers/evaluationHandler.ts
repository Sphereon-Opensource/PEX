import { PresentationDefinition } from '@sphereon/pe-models';

import { VerifiablePresentation } from '../../verifiablePresentation';
import { EvaluationClient } from '../evaluationClient';

export interface EvaluationHandler {
  client: EvaluationClient;
  setNext(handler: EvaluationHandler): EvaluationHandler;
  getNext(): EvaluationHandler;
  hasNext(): boolean;
  getName(): string;
  handle(pd: PresentationDefinition, p: VerifiablePresentation): void;
}
