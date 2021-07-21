import jp from 'jsonpath';
import Ajv from 'ajv';
import { Field, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import { Checked, Status } from '../ConstraintUtils';
import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class InputDescriptorFilterEvaluationHandler extends AbstractEvaluationHandler {

    private path_checked: Checked = {
        tag: 'root.input_descriptors',
        status: Status.ERROR,
        message: `The path property didn't match`
    }

    private filter_checked: Checked = {
        tag: 'root.input_descriptors',
        status: Status.ERROR,
        message: `The filter property didn't match`
    }

    public handle(pd: PresentationDefinition, p: any, result: Map<InputDescriptor, Map<any, Checked>>): void {
        this.ifInputCandidateMatchesFilter(pd, p, result)
        super.handle(pd, p, result);
    }

    private ifInputCandidateMatchesFilter(presentationDefinition: PresentationDefinition, inputCandidates: any, result: Map<InputDescriptor, Map<any, Checked>>): void {
        const inputDescriptors: InputDescriptor[] = presentationDefinition.input_descriptors;
        inputCandidates.verifiableCredential.forEach(vc => {
            for (const inputDescriptor of inputDescriptors) {
                if (inputDescriptor.constraints && inputDescriptor.constraints.fields) {
                    for (const field of inputDescriptor.constraints.fields) {
                        const pathResult = this.evaluatePath(vc, field);
                        if (!pathResult.length) {
                            result.get(inputDescriptor).set(vc, this.path_checked)
                        } else if (!this.evaluateFilter(pathResult[0], field)) {
                            result.get(inputDescriptor).set(vc, this.filter_checked)
                        }
                    }
                }
            }
        });
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