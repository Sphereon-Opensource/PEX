import { Field, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import Ajv from 'ajv';
import jp from 'jsonpath';

import { Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

export class InputDescriptorFilterEvaluationHandler extends AbstractEvaluationHandler {
  public getName(): string {
    return 'FilterEvaluation';
  }

  public handle(pd: PresentationDefinition, p: any): void {
    const inputDescriptors: InputDescriptor[] = pd.input_descriptors;
    for (const vc of p.verifiableCredential.entries()) {
      this.iterateOverInputDescriptors(inputDescriptors, vc);
    }
  }

  private iterateOverInputDescriptors(inputDescriptors: InputDescriptor[], vc: [number, unknown]): void {
    for (const inputDescriptor of inputDescriptors.entries()) {
      if (this.hasFields(inputDescriptor)) {
        this.iterateOverFields(inputDescriptor, vc);
      } else {
        const payload = { result: [], valid: true };
        this.results.push({
          ...this.createResultObject(inputDescriptor[0], vc[0], payload),
        });
      }
    }
  }

  private hasFields(inputDescriptor: [number, InputDescriptor]): boolean {
    return (
      inputDescriptor[1].constraints &&
      inputDescriptor[1].constraints.fields &&
      inputDescriptor[1].constraints.fields.length > 0
    );
  }

  private iterateOverFields(inputDescriptor: [number, InputDescriptor], vc: [number, unknown]): void {
    for (const field of inputDescriptor[1].constraints.fields) {
      const inputField = this.extractInputField(vc[1], field);
      if (!inputField.length) {
        const payload = { result: [], valid: false };
        this.createResponse(inputDescriptor, vc, payload, 'Input candidate failed to find jsonpath property');
      } else if (!this.evaluateFilter(inputField[0], field)) {
        const payload = { ['result']: { ...inputField[0] }, ['valid']: false };
        this.createResponse(inputDescriptor, vc, payload, 'Input candidate failed filter evaluation');
      } else {
        const payload = { ['result']: { ...inputField[0] }, ['valid']: true };
        this.results.push({
          ...this.createResultObject(inputDescriptor[0], vc[0], payload),
        });
      }
    }
  }

  private createResponse(
    inputDescriptor: [number, InputDescriptor],
    vc: [number, unknown],
    payload: { result: unknown[]; valid: boolean },
    message: string
  ) {
    this.results.push({
      ...this.createResultObject(inputDescriptor[0], vc[0], payload),
      ['status']: Status.ERROR,
      ['message']: message,
    });
  }

  private createResultObject(idIndex: number, vcIndex: number, payload: unknown): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIndex}]`,
      verifiable_credential_path: `$.verifiableCredential[${vcIndex}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: 'Input candidate valid for presentation submission',
      payload,
    };
  }

  private extractInputField(inputCandidate: unknown, field: Field): any {
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
    return true;
  }
}
