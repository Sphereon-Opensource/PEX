import { VerifiableCredential } from '../../types';
import { PresentationDefinition } from '../../types/SSI.types';
import { EvaluationClient } from '../evaluationClient';

export interface EvaluationHandler {
  client: EvaluationClient;
  setNext(handler: EvaluationHandler): EvaluationHandler;
  getNext(): EvaluationHandler | undefined;
  hasNext(): boolean;
  getName(): string;
  handle(pd: PresentationDefinition, p: VerifiableCredential[]): void;
}
