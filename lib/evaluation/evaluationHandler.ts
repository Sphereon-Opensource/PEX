import { PresentationDefinition } from '@sphereon/pe-models';

import { Checked } from "../ConstraintUtils";

export interface EvaluationHandler {
    setNext(handler: EvaluationHandler): EvaluationHandler;

    handle(pd: PresentationDefinition, p: any): Checked;
}