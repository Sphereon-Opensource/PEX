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

const AJV_FIELD_FILTER = new Ajv({
  verbose: false,
  code: { source: false, lines: true, esm: false },
  allowUnionTypes: true,
  allErrors: true,
  strict: false,
});
addFormats(AJV_FIELD_FILTER);

export class InputDescriptorFilterEvaluationHandler extends AbstractEvaluationHandler {
  private static FILTER_CACHE: Map<string, { ts: number; value: boolean }> = new Map();
  private static DEFAULT_MAX_FILTER_CACHE_SIZE = 100;
  private static DEFAULT_FILTER_CACHE_TTL = 1000 * 30; // 30 seconds
  private static DEFAULT_RESET_CACHE_SIZE = InputDescriptorFilterEvaluationHandler.DEFAULT_MAX_FILTER_CACHE_SIZE / 2;

  constructor(client: EvaluationClient) {
    super(client);
    InputDescriptorFilterEvaluationHandler.keepCacheSizeInCheck();
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

  private createResponse(
    field: {
      path: PathComponent[];
      value: FieldV1 | FieldV2;
    },
    vcIndex: number,
    payload: unknown,
    message: string,
  ): void {
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

    let evalResult: boolean | undefined = true;
    if (field.filter) {
      const successCacheKey = JSON.stringify({ filter: field.filter, value: result.value });

      const now = Date.now();
      evalResult = InputDescriptorFilterEvaluationHandler.FILTER_CACHE.get(successCacheKey)?.value;
      if (evalResult === undefined) {
        InputDescriptorFilterEvaluationHandler.keepCacheSizeInCheck();
        evalResult = AJV_FIELD_FILTER.validate(field.filter, result.value);
        InputDescriptorFilterEvaluationHandler.FILTER_CACHE.set(successCacheKey, {
          value: evalResult,
          ts: now + InputDescriptorFilterEvaluationHandler.DEFAULT_FILTER_CACHE_TTL,
        });
      }
    }
    return evalResult;
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

  static keepCacheSizeInCheck(opts?: { ttl?: number; maxCacheSize?: number; resetCacheSize?: number }) {
    const ttl = opts?.ttl ?? InputDescriptorFilterEvaluationHandler.DEFAULT_FILTER_CACHE_TTL;
    const maxCacheSize = opts?.maxCacheSize ?? InputDescriptorFilterEvaluationHandler.DEFAULT_MAX_FILTER_CACHE_SIZE;
    const resetCacheSize = opts?.resetCacheSize ?? InputDescriptorFilterEvaluationHandler.DEFAULT_RESET_CACHE_SIZE;

    const now = Date.now();
    for (const [key, result] of InputDescriptorFilterEvaluationHandler.FILTER_CACHE) {
      if (result.ts + ttl < now) {
        InputDescriptorFilterEvaluationHandler.FILTER_CACHE.delete(key);
      }
    }
    const size = InputDescriptorFilterEvaluationHandler.FILTER_CACHE.size;
    if (size > maxCacheSize) {
      const keys = InputDescriptorFilterEvaluationHandler.FILTER_CACHE.keys();
      // Since we cannot use a WeakMap, as the key is constructed on the fly and thus has no references, we need to clear the cache to avoid memory leaks
      for (let nr = 0; nr < size - resetCacheSize; nr++) {
        // would be wise to have sorted on oldest ts
        InputDescriptorFilterEvaluationHandler.FILTER_CACHE.delete(keys.next().value);
      }
    }
  }
}
