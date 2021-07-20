import jp from 'jsonpath';
import Ajv from 'ajv';
import { Field, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import { Checked, Status } from '../ConstraintUtils';
import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class InputDescriptorFilterEvaluationHandler extends AbstractEvaluationHandler {
    failed_checked: Checked = {
        tag: 'root.input_descriptors',
        status: Status.ERROR,
        message: 'The input candidate does not satisfy any filters of the input descriptors'
    };

    public handle(pd: PresentationDefinition, p: any): Checked {
        if (this.ifInputCandidateMatchesFilter(pd, p)) {
            return super.handle(pd, p);
        } else {
            return this.failed_checked;
        }
    }

    private ifInputCandidateMatchesFilter(presentationDefinition: PresentationDefinition, inputCandidate: any): boolean {
        const inputDescriptors: InputDescriptor[] = presentationDefinition.input_descriptors;
        for (const inputDescriptor of inputDescriptors) {
            if (inputDescriptor.constraints && inputDescriptor.constraints.fields) {
                for (const field of inputDescriptor.constraints.fields) {
                    const result = this.evaluatePath(inputCandidate, field);
                    if (!result.length || !this.evaluateFilter(result[0], field)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private evaluatePath(inputCandidate: any, field: Field): any {
        let result = [];
        for (const path of field.path) {
            result = jp.nodes(inputCandidate, path);
            if (result.length) {
                break;
            }
        }
        return result;
    }

    private evaluateFilter(result: any, field: Field) {
        if (field.filter) {
            const ajv = new Ajv();
            const valid = ajv.validate(field.filter, result.value);
            if (!valid) {
                return false;
            }
        }
        return true
    }
}