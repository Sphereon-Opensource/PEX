import { JSONPath as jp } from '@astronautlabs/jsonpath';
import { FieldV1, FieldV2 } from '@sphereon/pex-models';
import { WrappedVerifiableCredential } from '@sphereon/ssi-types';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition, InternalPresentationDefinitionV2, PathComponent } from '../../types';
import PexMessages from '../../types/Messages';
import { JsonPathUtils } from '../../utils';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class InputDescriptorFilterEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'FilterEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    const fields: { path: PathComponent[]; value: FieldV1 | FieldV2 }[] = jp.nodes(pd, '$..fields[*]');
    wrappedVcs.forEach((wvc: WrappedVerifiableCredential, vcIndex: number) => {
      this.createNoFieldResults(pd, vcIndex, wvc);
      fields.forEach((field) => {
        let inputField: { path: PathComponent[]; value: unknown }[] = [];
        if (field.value.path) {
          inputField = JsonPathUtils.extractInputField(wvc.decoded, field.value.path);
        }
        let resultFound = false;
        for (const inputFieldKey of inputField) {
          if (this.evaluateFilter(inputFieldKey, field.value)) {
            resultFound = true;
            const payload = { result: { ...inputField[0] }, valid: true, format: wvc.format };
            this.getResults().push({
              ...this.createResultObject(jp.stringify(field.path.slice(0, 3)), vcIndex, payload),
            });
          }
        }
        if (!resultFound) {
          if (!inputField.length) {
            const payload = { valid: false, format: wvc.format };
            this.createResponse(field, vcIndex, payload, PexMessages.INPUT_CANDIDATE_DOESNT_CONTAIN_PROPERTY);
          } else {
            const payload = { result: { ...inputField[0] }, valid: false, format: wvc.format };
            this.createResponse(field, vcIndex, payload, PexMessages.INPUT_CANDIDATE_FAILED_FILTER_EVALUATION);
          }
        }
      });
    });
    this.updatePresentationSubmission(pd);
  }

  private createNoFieldResults(pd: IInternalPresentationDefinition, vcIndex: number, credential: WrappedVerifiableCredential) {
    // PresentationDefinitionV2 is the common denominator
    const noFields = (pd as InternalPresentationDefinitionV2).input_descriptors
      .map((inDesc, index) => {
        return { index, inDesc };
      })
      .filter((el) => el.inDesc.constraints?.fields === undefined || el.inDesc.constraints?.fields?.length === 0);
    noFields.forEach((noField) => {
      const payload = { result: [], valid: true, format: credential.format };
      this.getResults().push({
        ...this.createResultObject(`$.input_descriptors[${noField.index}]`, vcIndex, payload),
      });
    });
  }

  private createResponse(field: { path: PathComponent[]; value: FieldV1 | FieldV2 }, vcIndex: number, payload: unknown, message: string): void {
    this.getResults().push({
      // TODO: why does this code assume a path to contain certain elements in the path?
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
      message: PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
      payload,
    };
  }

  private evaluateFilter(result: { path: PathComponent[]; value: unknown }, field: FieldV1 | FieldV2): boolean {
    if (field.filter?.format && field.filter.format === 'date') {
      this.transformDateFormat(result);
    }
    const ajv = new Ajv({ verbose: true, code: { source: true, lines: true, esm: false }, allowUnionTypes: true, allErrors: true, strict: false });
    addFormats(ajv);
    if (field.filter) {
      return ajv.validate(field.filter, result.value);
    }
    return true;
  }

  private transformDateFormat(result: { path: PathComponent[]; value: unknown }) {
    const date: Date = new Date(result.value as string);
    let month = date.getUTCMonth() + 1 + '';
    if (month.length === 1) {
      month = '0' + month;
    }
    let day = date.getUTCDate() + '';
    if (day.length === 1) {
      day = '0' + day;
    }
    result.value = date.getUTCFullYear() + '-' + month + '-' + day;

    result.value = date.toISOString().substring(0, date.toISOString().indexOf('T'));
  }
}
