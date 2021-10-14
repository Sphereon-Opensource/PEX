import {
  Constraints,
  Descriptor,
  Field,
  Format,
  HolderSubject,
  InputDescriptor,
  PresentationDefinition,
  PresentationSubmission,
  Schema,
  Statuses,
  SubmissionRequirement,
} from '@sphereon/pe-models';

import { Checked, hasErrors, Status } from '../../ConstraintUtils';

import { Validated } from './validated';

export type Target =
  | Field
  | Constraints
  | InputDescriptor
  | PresentationDefinition
  | PresentationSubmission
  | SubmissionRequirement
  | Descriptor[]
  | Format
  | Schema[]
  | HolderSubject
  | Statuses
  | string
  | string[];

export type ValidationPredicate<Target> = (t: Target) => boolean;

export class Validation {
  tag: string;
  target: Target;
  predicate: ValidationPredicate<Target>;
  message: string;
  status?: Status;
}

export type ValidateAll = (validations: Validation[]) => Validated;

export const validate: ValidateAll = (validations: Validation[]): Validated => {
  const validateResults: Checked[] = validations.map((validation) => mapper(validation));

  function toChecked(validation: Validation) {
    return new Checked(validation.tag, Status.ERROR, validation.message);
  }

  function toCheckedSuccess(tag: string) {
    return new Checked(tag, Status.INFO, 'ok');
  }

  function mapper(validation: Validation): Checked {
    let result;

    try {
      if (validation.predicate(validation.target)) {
        result = toCheckedSuccess(validation.tag);
      } else {
        result = toChecked(validation);
      }
    } catch (error) {
      // console.log(error.message);
      result = toChecked(validation);
    }
    return result;
  }

  const accumulateErrors = (accumulator: Checked[], checked: Checked): Checked[] => {
    if (checked.status !== Status.INFO) {
      accumulator.push(checked);
    }
    return accumulator;
  };

  const validated: Checked[] = validateResults.reduce(accumulateErrors, []);

  if (hasErrors(validated)) {
    return validated as Validated;
  } else {
    return [toCheckedSuccess('root')];
  }
};
