import { Constraints, Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

export class PredicateRelatedFieldEvaluationHandler extends AbstractEvaluationHandler {
  public getName(): string {
    return 'PredicateRelatedField';
  }

  public handle(pd: PresentationDefinition, _p: unknown, results: HandlerCheckResult[]): void {
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      const constraints: Constraints = pd.input_descriptors[i].constraints;
      if (constraints) {
        this.examinePredicateRelatedField(i, constraints, results);
      }
    }
  }

  private examinePredicateRelatedField(
    input_descriptor_idx: number,
    constraints: Constraints,
    results: HandlerCheckResult[]
  ): void {
    for (let i = 0; i < constraints.fields.length; i++) {
      for (let j = 0; j < results.length; j++) {
        this.examinePredicateForFilterEvaluationResult(results, j, input_descriptor_idx, constraints, i);
      }
    }
  }

  private examinePredicateForFilterEvaluationResult(results: HandlerCheckResult[], j: number, input_descriptor_idx: number, constraints: Constraints, i: number) {
    const resultInputDescriptorIdx = this.retrieveResultInputDescriptorIdx(results[j].input_descriptor_path);
    if (results[j].evaluator === 'FilterEvaluation' && input_descriptor_idx === resultInputDescriptorIdx && constraints.fields[i].predicate) {
      if (constraints.fields[i].predicate === Optionality.Required) {
        results.push({
          input_descriptor_path: `$.input_descriptors[${input_descriptor_idx}]`,
          verifiable_credential_path: results[j].verifiable_credential_path,
          evaluator: this.getName(),
          status: Status.INFO,
          message: 'Input candidate valid for presentation submission',
          payload: results[j].payload.result.value,
        });
      } else {
        results.push({
          input_descriptor_path: `$.input_descriptors[${input_descriptor_idx}]`,
          verifiable_credential_path: results[j].verifiable_credential_path,
          evaluator: this.getName(),
          status: Status.INFO,
          message: 'Input candidate valid for presentation submission',
          payload: true,
        });
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
}
