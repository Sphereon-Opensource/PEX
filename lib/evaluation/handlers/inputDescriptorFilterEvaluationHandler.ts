import { Field } from '@sphereon/pe-models';
import Ajv from 'ajv';
import jp, { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { InternalVerifiableCredential } from '../../types';
import { InternalPresentationDefinition, InternalPresentationDefinitionV2 } from '../../types/SSI.types';
import { JsonPathUtils } from '../../utils';
import { EvaluationClient } from '../evaluationClient';
import { HandlerCheckResult } from '../handlerCheckResult';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class InputDescriptorFilterEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'FilterEvaluation';
  }

  public handle(pd: InternalPresentationDefinition, vcs: InternalVerifiableCredential[]): void {
    const fields: { path: PathComponent[]; value: Field }[] = jp.nodes(pd, '$..fields[*]');
    vcs.forEach((vc: InternalVerifiableCredential, vcIndex: number) => {
      this.createNoFieldResults(pd, vcIndex);
      fields.forEach((field) => {
        let inputField = [];
        if (field.value.path) {
          inputField = JsonPathUtils.extractInputField(vc, field.value.path);
        }
        if (!inputField.length) {
          const payload = { valid: false };
          this.createResponse(field, vcIndex, payload, 'Input candidate does not contain property');
        } else if (!this.evaluateFilter(inputField[0], field.value)) {
          const payload = { result: { ...inputField[0] }, valid: false };
          this.createResponse(field, vcIndex, payload, 'Input candidate failed filter evaluation');
        } else {
          const payload = { result: { ...inputField[0] }, valid: true };
          this.getResults().push({
            ...this.createResultObject(jp.stringify(field.path.slice(0, 3)), vcIndex, payload),
          });
        }
      });
    });
    this.updatePresentationSubmission(pd);
  }

  private createNoFieldResults(pd: InternalPresentationDefinition, vcIndex: number) {
    // PresentationDefinitionV2 is the common denominator
    const noFields = (pd as InternalPresentationDefinitionV2).input_descriptors
      .map((inDesc, index) => {
        return { index, inDesc };
      })
      .filter((el) => el.inDesc.constraints?.fields === undefined || el.inDesc.constraints?.fields?.length === 0);
    noFields.forEach((noField) => {
      const payload = { result: [], ['valid']: true };
      this.getResults().push({
        ...this.createResultObject(`$.input_descriptors[${noField.index}]`, vcIndex, payload),
      });
    });
  }

  private createResponse(
    field: { path: PathComponent[]; value: Field },
    vcIndex: number,
    payload: { result?: { path: PathComponent[]; value: unknown }; valid: boolean },
    message: string
  ): void {
    this.getResults().push({
      ...this.createResultObject(jp.stringify(field.path.slice(0, 3)), vcIndex, payload),
      ['status']: Status.ERROR,
      ['message']: message,
    });
  }

  private createResultObject(path: string, vcIndex: number, payload: unknown): HandlerCheckResult {
    return {
      input_descriptor_path: path,
      verifiable_credential_path: `$[${vcIndex}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: 'Input candidate valid for presentation submission',
      payload,
    };
  }

  private evaluateFilter(result: { path: string[]; value: unknown }, field: Field): boolean {
    if (field.filter) {
      return new Ajv().validate(field.filter, result.value);
    }
    return true;
  }
}
