import { PresentationDefinition } from '@sphereon/pe-models';

import { Checked } from "../ConstraintUtils";

import { EvaluationHandler } from "./evaluationHandler";

export abstract class AbstractEvaluationHandler implements EvaluationHandler
{
    private nextHandler: EvaluationHandler;

    public setNext(handler: EvaluationHandler): EvaluationHandler {
        this.nextHandler = handler;
        return handler;
    }

    public handle(d: PresentationDefinition, p: any): Checked {
        if (this.nextHandler) {
            return this.nextHandler.handle(d, p);
        }

        return null;
    }
}