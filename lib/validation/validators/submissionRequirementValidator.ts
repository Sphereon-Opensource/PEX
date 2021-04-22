import {PresentationDefinition, SubmissionRequirement} from 'pe-models';

import {executeValidations, Invalid, NonEmptyArray, Predicate, Validated} from '../core';

import {BaseValidator} from './baseValidator';

export class SubmissionRequirementValidator extends BaseValidator<any> {

  protected filter(presentationDefinition: PresentationDefinition): SubmissionRequirement | SubmissionRequirement[] {
    return presentationDefinition.submission_requirements;
  }

  _validate(submissionRequirements: SubmissionRequirement[]): Validated<SubmissionRequirement> {

    const ruleIsMandatory = 'rule is a mandatory field';
    const needsExactlyOneOfFromAndFromNested = 'needs exactly one of \'from\' and \'from_nested\'';
    const fromNestedShouldBeArray = 'The value of the from_nested property MUST be an array';
    const isCountAPracticalPositiveInteger = '\'count\' must be a practical positive number';
    const isMinAPracticalPositiveInteger = '\'min\' must be a practical positive number';
    const isMaxAPracticalPositiveInteger = '\'max\' must be a practical positive number';
    const ruleShouldBePickOrAll = '\'rule\' should be either \'pick\' or \'all\'';

    let result: NonEmptyArray<Invalid>;

    for (const sr of submissionRequirements) {
      const validatedResults = executeValidations(
        sr,
        [
          [this.ruleIsMandatory(), ruleIsMandatory],// Validation 4.2.1.A
          [this.needsExactlyOneOfFromAndFromNested(), needsExactlyOneOfFromAndFromNested],// Validation 4.2.1.B.A
          [this.fromNestedShouldBeArray(), fromNestedShouldBeArray],// Validation 4.2.1.D

          // TODO Validation 4.2.1.E All objects in from_nested should be of type \'SubmissionRequirement\'
          //      See if it can be implemented in pe-api yamls. currently in typescript type of this variable is 'any'
          //      i.e. from_nested?: Array<object>;

          [this.isCountAPracticlePositiveInteger(), isCountAPracticalPositiveInteger],// Validation 4.2.2.B.A.A
          [this.isMinAPracticlePositiveInteger(), isMinAPracticalPositiveInteger],// Validation 4.2.2.B.B.A
          [this.isMaxAPracticlePositiveInteger(), isMaxAPracticalPositiveInteger],// Validation 4.2.2.B.C.A
          [this.ruleShouldBePickOrAll(), ruleShouldBePickOrAll]// Validation 4.2.4
        ]
      );

      if (Array.isArray(validatedResults)) {
        result = validatedResults;
      }
      if (sr.from_nested != null) {
        result = [...result, ...new SubmissionRequirementValidator().validate(sr.from_nested)];
      }
    }
    return result;
  }

  isCountAPracticlePositiveInteger(): Predicate<SubmissionRequirement> {
    return (sr: SubmissionRequirement) =>
      sr.rule !== 'pick' ||
      (
        typeof sr.count === "number" &&
        0 < sr.count &&
        sr.count < 1000 // only this line is an assumption taken. We should not keep it unbounded.
      );
  }

  isMinAPracticlePositiveInteger(): Predicate<SubmissionRequirement> {
    return (sr: SubmissionRequirement) =>
      sr.rule !== 'pick' ||
      (
        typeof sr.min === "number" &&
        0 < sr.min &&
        sr.min < 1000 // only this line is an assumption taken. We should not keep it unbounded.
      );
  }

  isMaxAPracticlePositiveInteger(): Predicate<SubmissionRequirement> {
    return (sr: SubmissionRequirement) =>
      sr.rule !== 'pick' ||
      (
        typeof sr.max === "number" &&
        0 < sr.max &&
        sr.max < 1000 // only this line is an assumption taken. We should not keep it unbounded.
      );
  }

  private ruleIsMandatory() {
    return (sr: SubmissionRequirement): boolean =>
      sr.rule !== undefined;
  }

  private needsExactlyOneOfFromAndFromNested() {
    return (sr: SubmissionRequirement): boolean =>
      (sr.from == null) !== (sr.from_nested == null); // XOR
  }

  private fromNestedShouldBeArray() {
    return (sr: SubmissionRequirement): boolean =>
      Array.isArray(sr.from_nested);
  }

  private ruleShouldBePickOrAll() {
    return (sr: SubmissionRequirement): boolean =>
      sr.rule === 'pick' || sr.rule === 'all';
  }

}
