import { Rules } from '@sphereon/pex-models';

export enum SubmissionRequirementMatchType {
  /**
   * Match for a submission_requirements entry in the presentation definition. If the match type
   * is `SubmissionRequirement` the {@link SubmissionRequirementMatch.id} property refers to the index
   * of the `submission_requirements` entry in the presentation definition.
   *
   * If the match is a nested match result, this match type refers to the nested index. E.g. a presentation
   * definition has three `submission_requirements` entries where the second submission requirement (index 1)
   * has two `from_nested` `submission_requirements` entries and this match referes to the second (index 1) of
   * this from nested, the {@link SubmissionRequirementMatch.id} property of the outer match refers to the outer index
   * in the `submission_requirements` entries, and the nested {@link SubmissionRequirementMatch.id} refers to index of the
   * `from_nested` entries. This can go multiple layers deep.
   */
  SubmissionRequirement = 'SubmissionRequirement',

  /**
   * Match for an input_descriptors entry in the presentation definition. This type will be used
   * if no submission_requirements are present in the presentation definition. If the match type
   * is `InputDescriptor` the {@link SubmissionRequirementMatch.id} property referes to the `id`
   * of the `input_descriptors` entry in the presentation definition.
   */
  InputDescriptor = 'InputDescriptor',
}

export interface SubmissionRequirementMatch {
  type: SubmissionRequirementMatchType;
  id: string | number;
  name?: string;
  rule: Rules;
  min?: number;
  count?: number;
  max?: number;
  vc_path: string[];
  from?: string;
  from_nested?: SubmissionRequirementMatch[];
}
