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

  public handle(pd: PresentationDefinition, p: any, results: HandlerCheckResult[]): void {
    const inputDescriptors: InputDescriptor[] = pd.input_descriptors;
    for (const vc of p.verifiableCredential.entries()) {
      this.iterateOverInputDescriptors(inputDescriptors, vc, results);
    }
  }

  private iterateOverInputDescriptors(inputDescriptors: InputDescriptor[], vc: [number, any], results: HandlerCheckResult[]): void {
    for (const inputDescriptor of inputDescriptors.entries()) {
      if (this.hasFields(inputDescriptor)) {
        this.iterateOverFields(inputDescriptor, vc, results);
      } else {
        const payload = { "result": [], "valid": true };
        results.push({
          ...this.createResultObject(inputDescriptor[0], vc[0], payload)
        })
      }
    }
  }

  private hasFields(inputDescriptor: [number, InputDescriptor]): boolean {
    return inputDescriptor[1].constraints && inputDescriptor[1].constraints.fields && inputDescriptor[1].constraints.fields.length > 0;
  }

  private iterateOverFields(inputDescriptor: [number, InputDescriptor], vc: [number, any], results: HandlerCheckResult[]): void {
    for (const field of inputDescriptor[1].constraints.fields) {
      const inputField = this.extractInputField(vc[1], field);
      if (!inputField.length) {
        const payload = { "result": [], "valid": false };
        this.createResponse(results, inputDescriptor, vc, payload, 'Input candidate failed to find jsonpath property');
      } else if (!this.evaluateFilter(inputField[0], field)) {
        const payload = { ['result']: [...inputField], ['valid']: false }
        this.createResponse(results, inputDescriptor, vc, payload, 'Input candidate failed filter evaluation');
      } else {
        const payload = { ['result']: [...inputField], ['valid']: true }
        results.push({
          ...this.createResultObject(inputDescriptor[0], vc[0], payload)
        })
      }
    }
  }

  private createResponse(results: HandlerCheckResult[], inputDescriptor: [number, InputDescriptor],
    vc: [number, any], payload: { result: any[]; valid: boolean; }, message: string) {
    results.push({
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

  private extractInputField(inputCandidate: any, field: Field): any {
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