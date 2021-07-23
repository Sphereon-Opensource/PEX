import { Constraints, Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';
import { JsonUtils } from '../utils/jsonUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

export class PredicateRelatedFieldEvaluationHandler extends AbstractEvaluationHandler {
  public getName(): string {
    return 'PredicateRelatedField';
  }

  public handle(pd: PresentationDefinition, p: unknown, results: HandlerCheckResult[]): void {
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      const constraints: Constraints = pd.input_descriptors[i].constraints;
      if (constraints) {
        this.examinePredicateRelatedField(i, constraints, p, results);
      }
    }
  }

  private examinePredicateRelatedField(
    input_descriptor_idx: number,
    constraints: Constraints,
    verifiablePresentation: unknown,
    results: HandlerCheckResult[]
  ): void {
    for (let i = 0; i < constraints.fields.length; i++) {
      const field = constraints.fields[i];
      if (field.predicate) {
        this.checkPaths(input_descriptor_idx, i, field.predicate, field.path, verifiablePresentation, results);
      }
    }
  }

  private checkPaths(
    input_descriptor_idx: number,
    constraint_field_idx: number,
    necessity: Optionality,
    paths: Array<string>,
    verifiablePresentation: any,
    results: HandlerCheckResult[]
  ): void {
    for (let i = 0; i < verifiablePresentation.verifiableCredential.length; i++) {
      let foundPath = false;
      for (let j = 0; j < paths.length || foundPath; j++) {
        foundPath = JsonUtils.jsonHasKey(verifiablePresentation.verifiableCredential[i], paths[j]);
      }
      const status = foundPath ? Status.INFO : necessity === Optionality.Required ? Status.ERROR : Status.WARN;
      const message = foundPath
        ? 'predicate related field is present in the verifiableCredential.'
        : necessity === Optionality.Required
        ? "It's required to have the predicate related field is present in the verifiableCredential."
        : "It's preferred to have the predicate related field is present in the verifiableCredential.";

      const input_descriptor_path =
        'root.input_descriptors[' + input_descriptor_idx + ']' + '.constraints.fields[' + constraint_field_idx + ']';
      const verifiable_credential_path = 'root.verifiableCredential[' + i + ']';
      results.push({
        input_descriptor_path,
        verifiable_credential_path,
        evaluator: this.getName(),
        status: status,
        message: message,
      });
    }
  }
}
