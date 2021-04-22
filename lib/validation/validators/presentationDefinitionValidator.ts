import {PresentationDefinition} from 'pe-models';

import {executeValidations, Predicate} from '../core';

import {SubmissionRequirementValidator} from './submissionRequirementValidator'

export class PresentationDefinitionValidator {

  _validate(presentationDefinition: PresentationDefinition) {

    const srFromShouldBeInInputDescGroups = 'The value of \'from\' property MUST be a group string matching one of the group strings specified for one or more input_descriptor_objects';

    if (presentationDefinition.submission_requirements !== null) {
      new SubmissionRequirementValidator().validate(presentationDefinition);

      executeValidations(
        presentationDefinition,
        [
          [this.allSrFromItemsShouldBeInInputDescGroups(), srFromShouldBeInInputDescGroups]// Validation 4.2.1.C
        ]
      );
    } else {
      // TODO In this case all descriptors listed in input_descriptors must be present in presentation_submission.
    }

  }

  allSrFromItemsShouldBeInInputDescGroups(): Predicate<PresentationDefinition> {
    return (pd: PresentationDefinition): boolean =>
      pd !== pd; // TODO check from_nested recursively.
    // return pd.input_descriptors.map(inDesc => inDesc.group).find((grp) => grp === sr.from) !== undefined
  }
}