import { Field, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class FilterShouldExistIfPredicateEvaluationHandler extends AbstractEvaluationHandler {
  failed_checked: Checked = {
    tag: 'root.input_descriptors',
    status: Status.ERROR,
    message: 'if in the field we have predicate value, the filter value should be present as well.'
  };

  public handle(pd: PresentationDefinition, p: any): Checked {

    // HERE we process the predicate part of the PD
    if (FilterShouldExistIfPredicateEvaluationHandler.ifPredicateIsPresentFilterShouldBePresent(pd)) {
      return super.handle(pd, p);
    } else {
      return this.failed_checked;
    }
  }

  static ifPredicateIsPresentFilterShouldBePresent(presentationDefinition: PresentationDefinition): boolean {
    for (let i = 0; i < presentationDefinition.input_descriptors.length; i++) {
      const inputDescriptor: InputDescriptor = presentationDefinition.input_descriptors[i];
      for (let j = 0; j < inputDescriptor.constraints.fields.length; j++) {
        const field: Field = inputDescriptor.constraints.fields[j];
        if (field.predicate) {
          return field.filter != null;
        }
      }
    }
    return true;
  }
}