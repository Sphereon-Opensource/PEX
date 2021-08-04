import { Constraints, Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { EvaluationClient } from './evaluationClient';
import { HandlerCheckResult } from './handlerCheckResult';

export class PredicateRelatedFieldEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'PredicateRelatedFieldEvaluation';
  }

  public handle(pd: PresentationDefinition): void {
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      if (pd.input_descriptors[i].constraints && pd.input_descriptors[i].constraints.fields) {
        this.examinePredicateRelatedField(i, pd.input_descriptors[i].constraints);
      }
    }
  }

  private examinePredicateRelatedField(input_descriptor_idx: number, constraints: Constraints): void {
    for (let i = 0; i < constraints.fields.length; i++) {
      for (let j = 0; j < this.getResults().length; j++) {
        this.examinePredicateForFilterEvaluationResult(this.getResults(), j, input_descriptor_idx, constraints, i);
      }
    }
  }

  private examinePredicateForFilterEvaluationResult(
    results: HandlerCheckResult[],
    resultIdx: number,
    input_descriptor_idx: number,
    constraints: Constraints,
    fieldIdx: number
  ) {
    const resultInputDescriptorIdx = this.retrieveResultInputDescriptorIdx(results[resultIdx].input_descriptor_path);
    if (
      results[resultIdx].payload &&
      results[resultIdx].payload.result &&
      results[resultIdx].payload.result.path &&
      results[resultIdx].evaluator === 'FilterEvaluation' &&
      input_descriptor_idx === resultInputDescriptorIdx &&
      constraints.fields[fieldIdx].predicate &&
      constraints.fields[fieldIdx].path.includes(this.concatenatePath(results[resultIdx].payload.result.path))
    ) {
      const evaluationResult = { ...results[resultIdx].payload.result };
      const resultObject = this.createResultObject(input_descriptor_idx, resultIdx, evaluationResult, results);
      if (constraints.fields[fieldIdx].predicate === Optionality.Required) {
        results.push(resultObject);
      } else {
        resultObject.payload.value = true;
        results.push(resultObject);
      }
    }
  }

  private retrieveResultInputDescriptorIdx(input_descriptor_path: string): number {
    const inputDescriptorText = '$.input_descriptors[';
    const startIdx = input_descriptor_path.indexOf(inputDescriptorText);
    const startWithIdx = input_descriptor_path.substring(startIdx + inputDescriptorText.length);
    const endIdx = startWithIdx.indexOf(']');
    const idx = startWithIdx.substring(0, endIdx);
    return parseInt(idx);
  }

  private concatenatePath(path) {
    let completePath = '';
    for (let i = 0; i < path.length; i++) {
      completePath += path[i] + '.';
    }
    return completePath.substring(0, completePath.length - 1);
  }

  private createResultObject(
    input_descriptor_idx: number,
    resultIdx: number,
    evaluationResult: any,
    results: HandlerCheckResult[]
  ) {
    return {
      input_descriptor_path: `$.input_descriptors[${input_descriptor_idx}]`,
      verifiable_credential_path: results[resultIdx].verifiable_credential_path,
      evaluator: this.getName(),
      status: Status.INFO,
      message: 'Input candidate valid for presentation submission',
      payload: evaluationResult,
    };
  }
}
