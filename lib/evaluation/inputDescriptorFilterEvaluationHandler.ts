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
        for (const vc of p.verifiableCredential.entries()) {
            result.push(...this.iterateOverInputDescriptors(inputDescriptors, vc));
        }
        return result;
    }

    private iterateOverInputDescriptors(inputDescriptors: InputDescriptor[], vc: [number, any]): HandlerCheckResult[] {
        const result: HandlerCheckResult[] = [];
        for (const inputDescriptor of inputDescriptors.entries()) {
            if (inputDescriptor[1].constraints && inputDescriptor[1].constraints.fields && inputDescriptor[1].constraints.fields.length > 0) {
                result.push(...this.iterateOverFields(inputDescriptor, vc));
            } else {
                const payload = { "result": [], "valid": true };
                result.push({
                    ...this.createResultObject(inputDescriptor[0], vc[0], payload)
                })
            }
        }
        return result;
    }

    private iterateOverFields(inputDescriptor: [number, InputDescriptor], vc: [number, any]): HandlerCheckResult[] {
        const result: HandlerCheckResult[] = [];
        for (const field of inputDescriptor[1].constraints.fields) {
            const pathResult = this.evaluatePath(vc[1], field);
            if (!pathResult.length) {
                const payload = { "result": [], "valid": false };
                this.createResponse(result, inputDescriptor, vc, payload, 'Input candidate failed to find jsonpath property');
            } else if (!this.evaluateFilter(pathResult[0], field)) {
                const payload = { ['result']: [...pathResult], ['valid']: false }
                this.createResponse(result, inputDescriptor, vc, payload, 'Input candidate failed filter evaluation');
            } else {
                const payload = { ['result']: [...pathResult], ['valid']: true } 
                result.push({
                    ...this.createResultObject(inputDescriptor[0], vc[0], payload)
                })
            }
        }
        return result;
    }

    private createResponse(result: HandlerCheckResult[], inputDescriptor: [number, InputDescriptor],
         vc: [number, any], payload: { result: any[]; valid: boolean; }, message: string) {
        result.push({
            ...this.createResultObject(inputDescriptor[0], vc[0], payload),
            ['status']: Status.ERROR,
            ['message']: message
        });
    }

    private createResultObject(idIndex: number, vcIndex: number, payload: any): HandlerCheckResult {
        return {
            input_descriptor_path: `$.input_descriptors[${idIndex}]`,
            verifiable_credential_path: `$.verifiableCredential[${vcIndex}]`,
            evaluator: this.getName(),
            status: Status.INFO,
            message: 'Input candidate valid for presentation submission',
            payload
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