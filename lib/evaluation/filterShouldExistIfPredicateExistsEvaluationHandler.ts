import { Field, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

export class FilterShouldExistIfPredicateExistsEvaluationHandler extends AbstractEvaluationHandler {
  public getName(): string {
    return 'FilterShouldExistIfPredicateExists';
  }

  public handle(pd: PresentationDefinition, _vp: any, results: HandlerCheckResult[]): void {
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      const inputDescriptor: InputDescriptor = pd.input_descriptors[i];
      if (inputDescriptor.constraints && inputDescriptor.constraints.fields) {
        for (let j = 0; j < inputDescriptor.constraints.fields.length; j++) {
          const field: Field = inputDescriptor.constraints.fields[j];
          if (field.predicate) {
            const input_descriptor_path = '$.input_descriptors[' + i + '].constraints.fields[' + j + ']';
            if (field.filter) {
              results.push({
                input_descriptor_path,
                verifiable_credential_path: '',
                evaluator: this.getName(),
                status: Status.INFO,
                message: 'predicate value and the filter value are both present.',
              });
            } else {
              results.push({
                input_descriptor_path,
                verifiable_credential_path: '',
                evaluator: this.getName(),
                status: Status.ERROR,
                message: 'if in the field we have predicate value, the filter value should be present as well.',
              });
            }
          }
        }
      }
    }
  }
}
