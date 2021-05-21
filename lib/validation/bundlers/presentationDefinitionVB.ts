import { PresentationDefinition } from '@sphereon/pe-models';

import { Validation } from '../core';

import { InputDescriptorsVB } from './inputDescriptorsVB';
import { ValidationBundler } from './validationBundler';

export class PresentationDefinitionVB extends ValidationBundler<PresentationDefinition> {
  constructor(parentTag: string) {
    super(parentTag, 'presentation_definition');
  }

  public getValidations(pd: PresentationDefinition): Validation<unknown>[] {
    return this.myValidations(pd).concat(
      new InputDescriptorsVB(this.myTag).getValidations(pd.input_descriptors)
    );
  }

  private myValidations(pd: PresentationDefinition): Validation<unknown>[] {
    return [
      // V Section 4.A.A : pd.id must be non-empty.
      // V Section 4.A.A : MUST be a unique identifier
      // E Section 4.B   : The Input Descriptors (#term:input-descriptors) required for submission are described by the submission_requirements. If no submission_requirements value is present, all inputs listed in the input_descriptors array are required for submission.
      // V Section 4.C   : name == null || non-null string.
      // V Section 4.D   : purpose == null || non-empty string.
      // V Section 4.E.A : format == null || format.(jwt|jwt_vc|jwt_vp.alg[])|(ldp|ldp_vc|ldp_vp.proof_type[]) should be non-empty strings
      // V inDesc[i].group[i] : group == null || MUST match one of the grouping strings listed in the from values of a Submission Requirement Rule.

      {
        tag: this.getTag(),
        target: pd,
        predicate: PresentationDefinitionVB.shouldBeNonEmptyArray,
        message: 'inputDescriptors should be a non-empty array',
      },
    ];
  }

  private static shouldBeNonEmptyArray(pd: PresentationDefinition): boolean {
    // TODO extract to generic utils or use something like lodash
    return (
      pd.input_descriptors != null &&
      Array.isArray(pd.input_descriptors) &&
      pd.input_descriptors.length > 0
    );
  }
}
