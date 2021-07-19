import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked } from "../ConstraintUtils";

export interface EvaluationHandler {
    setNext(handler: EvaluationHandler): EvaluationHandler;

    handle(pd: PresentationDefinition, p: any, result: Map<InputDescriptor, Map<any, Checked>>): void;
}