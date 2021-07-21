import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked } from '../ConstraintUtils';

export interface EvaluationHandler {
  setNext(handler: EvaluationHandler): EvaluationHandler;

  handle(pd: PresentationDefinition, p: unknown, result: Map<InputDescriptor, Map<unknown, Checked>>): void;
}
