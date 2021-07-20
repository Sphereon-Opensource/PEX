import { Field, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class FilterShouldExistIfPredicateEvaluationHandler extends AbstractEvaluationHandler {

  // This incorrect format of input_descriptor is a deal-breaker for us, and therefore we throw exception for it
  public handle(pd: PresentationDefinition, p: any, result: Map<InputDescriptor, Map<any, Checked>>): void {
    // HERE we process the predicate part of the PD
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      const inputDescriptor: InputDescriptor = pd.input_descriptors[i];
      for (let j = 0; j < inputDescriptor.constraints.fields.length; j++) {
        const field: Field = inputDescriptor.constraints.fields[j];
        if (field.predicate && !field.filter) {
          throw new Error('if in the field we have predicate value, the filter value should be present as well.');
        }
      }
    }
    super.handle(pd, p, result);
  }
}
