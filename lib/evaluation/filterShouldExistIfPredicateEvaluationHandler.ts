import { Field, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class FilterShouldExistIfPredicateEvaluationHandler extends AbstractEvaluationHandler {

  failed_checked: Checked = {
    tag: 'root.input_descriptor',
    status: Status.ERROR,
    message: "if in the field we have predicate value, the filter value should be present as well.",
  };

  public handle(pd: PresentationDefinition, p: unknown, result: Map<InputDescriptor, Map<unknown, Checked>>): void {
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      const inputDescriptor: InputDescriptor = pd.input_descriptors[i];
      if (inputDescriptor.constraints && inputDescriptor.constraints.fields) {
        for (let j = 0; j < inputDescriptor.constraints.fields.length; j++) {
          const field: Field = inputDescriptor.constraints.fields[j];
          if (field.predicate && !field.filter) {
            this.updateAllResultsForInputDescriptor(p, result.get(inputDescriptor))
          }
        }
      }
    }
  }

  private updateAllResultsForInputDescriptor(verifiablePresentation: any, vcResult: Map<unknown, Checked>) {
    verifiablePresentation.verifiableCredential.foreach(vc => {
      vcResult.set(vc, this.failed_checked);
    });
  }
}
