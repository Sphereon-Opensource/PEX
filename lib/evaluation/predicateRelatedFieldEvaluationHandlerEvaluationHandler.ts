import { Constraints, Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';
import { JsonUtils } from '../utils/jsonUtils';

import { HandlerCheckResult } from './HandlerCheckResult';
import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class PredicateRelatedFieldEvaluationHandler extends AbstractEvaluationHandler {
  public getName(): string {
    return 'PredicateRelatedField';
  }

  public handle(pd: PresentationDefinition, p: unknown): HandlerCheckResult[] {
    const results: HandlerCheckResult[] = [];
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      const constraints: Constraints = pd.input_descriptors[i].constraints;
      if (constraints) {
        results.push(...this.examinePredicateRelatedField(i, constraints, p));
      }
    }
    return results;
  }

  private examinePredicateRelatedField(
    input_descriptor_idx: number,
    constraints: Constraints,
    verifiablePresentation: unknown
  ): HandlerCheckResult[] {
    const results: HandlerCheckResult[] = [];
    for (let i = 0; i < constraints.fields.length; i++) {
      const field = constraints.fields[i];
      if (field.predicate) {
        results.push(...this.checkPaths(input_descriptor_idx, i, field.predicate, field.path, verifiablePresentation));
      }
    }
    return results;
  }

  private checkPaths(
    input_descriptor_idx: number,
    constraint_field_idx: number,
    necessity: Optionality,
    paths: Array<string>,
    verifiablePresentation: any
  ) {
    const results: HandlerCheckResult[] = [];
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
        'root.input_descriptors[' + input_descriptor_idx + ']' + 'constraints.fields[' + constraint_field_idx + ']';
      const verifiable_credential_path = 'root.verifiableCredential[' + i + ']';
      results.push({
        input_descriptor_path,
        verifiable_credential_path,
        evaluator: this.getName(),
        status: status,
        message: message,
      });
    }
    return results;
  }

  /*private predicateRelatedFieldShouldBeBoolean(
    constraints: Constraints, verifiablePresentation: any): HandlerCheckResult[] {
    const predicateFields = [];
    constraints.fields.forEach((f) => {
      if (f.predicate) {
        predicateFields.push(...f.path);
      }
    });
    const predicateValueCandidate = [];

    predicateFields.forEach((pf) => {
      predicateValueCandidate.push({ pf: pf, values: [] });
    });

    verifiablePresentation.verifiableCredential.forEach((vc) => {
      predicateValueCandidate.forEach((pvc) => {
        //It's possible that for some VCs we have the boolean value for some other VCs we have the actual value?
        // Then we will need to check all the related paths to see if we have any boolean response for that specific field. if yes, then we're safe.
        const filterKey: string = pvc.pf.substring(2);
        if (vc[filterKey]) {
          pvc.values.push(vc[filterKey]);
          pvc.vc = vc;
        }
      });
    });
    for (let i = 0; i < predicateValueCandidate.length; i++) {
      const pvc = predicateValueCandidate[i];
      // Here we check for each entry to have at least one boolean field
      let foundBooleanVal = false;
      for (let i = 0; i < pvc.values.length; i++) {
        if (pvc.values[i] === false || pvc.values[i] === true) {
          foundBooleanVal = true;
        }
      }
      if (foundBooleanVal === false) {
        verifiableCredentialChecked.set(pvc.vc, this.failed_checked);
      }
    }
  }*/
}
