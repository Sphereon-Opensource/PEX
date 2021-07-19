import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class PredicateRelatedFieldShouldBeBooleanEvaluationHandler extends AbstractEvaluationHandler {
  failed_checked: Checked = {
    tag: 'root.input_descriptors',
    status: Status.ERROR,
    message: 'verifiableCredential\'s matching predicate property should be boolean.'
  };

  public handle(pd: PresentationDefinition, p: any): Checked {

    // HERE we process the predicate part of the PD
    if (PredicateRelatedFieldShouldBeBooleanEvaluationHandler.predicateRelatedFieldShouldBeBoolean(pd.input_descriptors, p)) {
      return super.handle(pd, p);
    } else {
      return this.failed_checked;
    }
  }

  private static predicateRelatedFieldShouldBeBoolean(
    inputDescriptors: InputDescriptor[],
    verifiablePresentation: any
  ): boolean {
    for (let i = 0; i < inputDescriptors.length; i++) {
      const inputDescriptor: InputDescriptor = inputDescriptors[i];
      const predicateFields = [];
      inputDescriptor.constraints.fields.forEach((f) => {
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
          if (vc[pvc.pf]) {
            pvc.values.push(vc[pvc.pf].substring(2));
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
          return false;
        }
      }
    }
    return true;
  }
}