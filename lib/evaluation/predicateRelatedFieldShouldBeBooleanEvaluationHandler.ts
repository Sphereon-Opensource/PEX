import { Constraints, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class PredicateRelatedFieldShouldBeBooleanEvaluationHandler extends AbstractEvaluationHandler {
  failed_checked: Checked = {
    tag: 'root.input_descriptor',
    status: Status.ERROR,
    message: "verifiableCredential's matching predicate property should be boolean.",
  };

  public handle(pd: PresentationDefinition, p: any, result: Map<InputDescriptor, Map<any, Checked>>): void {
    // HERE we process the predicate part of the PD
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      const constraints: Constraints = pd.input_descriptors[i].constraints;
      if (constraints) {
        this.predicateRelatedFieldShouldBeBoolean(constraints, p, result.get(pd.input_descriptors[i]));
      }
    }
    return super.handle(pd, p, result);
  }

  private predicateRelatedFieldShouldBeBoolean(
    constraints: Constraints,
    verifiablePresentation: any,
    verifiableCredentialChecked: Map<any, Checked>
  ): void {
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
        //It's possible that for some VCs we have the boolean value for some othe VCs we have the actual value?
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
  }
}
