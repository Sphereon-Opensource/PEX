import { SubmissionRequirement } from 'pe-models';

import { Predicate, Validation } from '../core';

import { ValidationBundler } from './validationBundler';

export class SubmissionRequirementVB extends ValidationBundler<SubmissionRequirement> {
  private readonly ruleIsMandatoryMsg = 'rule is a mandatory field';
  private readonly needsOneFromOrFromNestedMsg =
    'needs exactly one of from or from_nested';
  private readonly fromNestedShouldBeArrayMsg =
    'The value of the from_nested property MUST be an array';
  private readonly isCountPositiveIntMsg =
    'count must be a practical positive number';
  private readonly isMinPositiveIntMsg =
    'min must be a practical positive number';
  private readonly isMaxPositiveIntMsg =
    'max must be a practical positive number';
  private readonly ruleShouldBePickOrAllMsg =
    'rule should be either pick or all';

  constructor(parentTag: string) {
    super(parentTag, 'submission_requirements');
  }

  public getValidations(
    srs: SubmissionRequirement[]
  ): Validation<SubmissionRequirement>[] {
    return this.myValidations(srs);
  }

  private myValidations(
    srs: SubmissionRequirement[]
  ): Validation<SubmissionRequirement>[] {
    let validations: Validation<SubmissionRequirement>[] = [];
    for (let srInd = 0; srInd < srs.length; srInd++) {
      validations = [
        ...validations,
        ...this.getMyValidations(srInd, srs),
        ...this.getSubValidations(srInd, srs),
      ];
    }
    return validations;
  }

  private getMyValidations(
    srInd: number,
    srs: SubmissionRequirement[]
  ): Validation<SubmissionRequirement>[] {
    return [
      {
        tag: this.getMyTag(srInd),
        target: srs[srInd],
        predicate: this.ruleIsMandatory(),
        message: this.ruleIsMandatoryMsg,
      }, // Validation 4.2.1.A
      {
        tag: this.getMyTag(srInd),
        target: srs[srInd],
        predicate: this.needsOneFromOrFromNested(),
        message: this.needsOneFromOrFromNestedMsg,
      }, // Validation 4.2.1.B.A
      {
        tag: this.getMyTag(srInd),
        target: srs[srInd],
        predicate: this.fromNestedShouldBeArray(),
        message: this.fromNestedShouldBeArrayMsg,
      }, // Validation 4.2.1.D

      // TODO Validation 4.2.1.E All objects in from_nested should be of type SubmissionRequirement
      //      See if it can be implemented in pe-api yamls. currently in typescript type of this variable is 'any'
      //      i.e. from_nested?: Array<object>;

      {
        tag: this.getMyTag(srInd),
        target: srs[srInd],
        predicate: this.isCountPositiveInt(),
        message: this.isCountPositiveIntMsg,
      }, // Validation 4.2.2.B.A.A
      {
        tag: this.getMyTag(srInd),
        target: srs[srInd],
        predicate: this.isMinPositiveInt(),
        message: this.isMinPositiveIntMsg,
      }, // Validation 4.2.2.B.B.A
      {
        tag: this.getMyTag(srInd),
        target: srs[srInd],
        predicate: this.isMaxPositiveInt(),
        message: this.isMaxPositiveIntMsg,
      }, // Validation 4.2.2.B.C.A
      {
        tag: this.getMyTag(srInd),
        target: srs[srInd],
        predicate: this.ruleShouldBePickOrAll(),
        message: this.ruleShouldBePickOrAllMsg,
      }, // Validation 4.2.4
    ];
  }

  protected getMyTag(srInd: number) {
    return this.parentTag + '.' + this.myTag + '[' + srInd + ']';
  }

  private getSubValidations(
    srInd: number,
    srs: SubmissionRequirement[]
  ): Validation<SubmissionRequirement>[] {
    const fromNested = srs[srInd].from_nested as SubmissionRequirement[];
    return fromNested != null
      ? new SubmissionRequirementVB(
          this.getFromNestedTag(srInd)
        ).getValidations(fromNested)
      : [];
  }

  private getFromNestedTag(srInd: number) {
    return this.getMyTag(srInd) + '.' + 'from_nested';
  }

  isCountPositiveInt(): Predicate<SubmissionRequirement> {
    return (sr: SubmissionRequirement) =>
      sr.rule !== 'pick' || sr.count == null || 0 < sr.count;
  }

  isMinPositiveInt(): Predicate<SubmissionRequirement> {
    return (sr: SubmissionRequirement) =>
      sr.rule !== 'pick' || sr.min == null || 0 < sr.min;
  }

  isMaxPositiveInt(): Predicate<SubmissionRequirement> {
    return (sr: SubmissionRequirement) =>
      sr.rule !== 'pick' || sr.max == null || 0 < sr.max;
  }

  private ruleIsMandatory() {
    return (sr: SubmissionRequirement): boolean => sr.rule != null;
  }

  private needsOneFromOrFromNested() {
    return (sr: SubmissionRequirement): boolean =>
      (sr.from == null) !== (sr.from_nested == null); // XOR
  }

  private fromNestedShouldBeArray() {
    return (sr: SubmissionRequirement): boolean =>
      sr.from_nested == null || Array.isArray(sr.from_nested);
  }

  private ruleShouldBePickOrAll() {
    return (sr: SubmissionRequirement): boolean =>
      sr.rule === 'pick' || sr.rule === 'all';
  }
}
