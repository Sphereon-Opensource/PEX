import jp from 'jsonpath';
import Ajv from 'ajv';
import { Field, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import { Status } from '../ConstraintUtils';
import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

export class InputDescriptorFilterEvaluationHandler extends AbstractEvaluationHandler {
    
    public getName(): string {
        return 'FilterEvaluation';
    }

    public handle(pd: PresentationDefinition, p: any): HandlerCheckResult [] {
        const result: HandlerCheckResult[] = [];
        const inputDescriptors: InputDescriptor[] = pd.input_descriptors;
        for (const [vcIndex, vc] of p.verifiableCredential.entries()) {
            result.push(...this.iterateOverInputDescriptors(inputDescriptors, vcIndex, vc));
        }
        return result;
    }

    private iterateOverInputDescriptors(inputDescriptors: InputDescriptor[], vcIndex: number, vc: any): HandlerCheckResult[] {
        const result: HandlerCheckResult[] = [];
        for (const [idIndex, inputDescriptor] of inputDescriptors.entries()) {
            if (inputDescriptor.constraints && inputDescriptor.constraints.fields && inputDescriptor.constraints.fields.length > 0) {
                result.push(...this.iterateOverFields(inputDescriptor, vc, idIndex, vcIndex));
            } else {
                result.push({
                    ...this.createResultObject(idIndex, vcIndex)
                })
            }
        }
        return result;
    }

    private iterateOverFields(inputDescriptor: InputDescriptor, vc: any, idIndex: number, vcIndex: number): HandlerCheckResult[] {
        const
         result: HandlerCheckResult[] = [];
        for (const field of inputDescriptor.constraints.fields) {
            const pathResult = this.evaluatePath(vc, field);
            if (!pathResult.length) {
                result.push({ 
                    ...this.createResultObject(idIndex, vcIndex), 
                    ['status']: Status.ERROR,
                    ['message']: 'Input candidate failed to find jsonpath property'
                })
            } else if (!this.evaluateFilter(pathResult[0], field)) {
                result.push({
                    ...this.createResultObject(idIndex, vcIndex),
                    ['status']: Status.ERROR,
                    ['message']: 'Input candidate failed filter evaluation'
                })
            } else {
                result.push({
                    ...this.createResultObject(idIndex, vcIndex)
                })
            }
        }
        return result;
    }

    private createResultObject(idIndex: number, vcIndex: number): HandlerCheckResult {
        return {
            input_descriptor_path: `$.input_descriptors[${idIndex}]`,
            verifiable_credential_path: `$.verifiableCredential[${vcIndex}]`,
            evaluator: this.getName(),
            status: Status.INFO,
            message: 'Input candidate valid for presentation submission'
        }
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