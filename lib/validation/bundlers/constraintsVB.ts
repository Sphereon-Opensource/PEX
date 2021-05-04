import { Constraints, Directives, Optionality, Statuses } from 'pe-models';
import { HolderSubject } from 'pe-models/model/holderSubject';
import { PdStatus } from 'pe-models/model/pdStatus';

import { Predicate, Validation } from '../core';

import { FieldsVB } from './fieldsVB';
import { ValidationBundler } from './validationBundler';

export class ConstraintsVB extends ValidationBundler<Constraints> {
  private readonly disclosureLimitShouldHaveKnownValueMsg =
    'limit_disclosure should have known value';
  private readonly statusShouldHaveKnownValueMsg = 'Unknown status property';
  private readonly statusDirectiveShouldHaveKnownValueMsg =
    'status directive should have known value';
  private readonly subjectIsIssuerShouldBeKnownValueMsg =
    'subject_is_issuer should be known value';
  private readonly fieldIdIsMandatoryMsg =
    'is_holder object must contain field_id property';
  private readonly fieldIdMustBeArrayOfStringsMsg =
    'is_holder object field_id property must be an array of strings';
  private readonly fieldIdInIsHolderMustCorrespondToFieldIdMsg =
    'is_holder field_id must correspond to a present field object id property';
  private readonly subjectMustContainDirectivePropertyMsg =
    'is_holder object must contain a directive property';
  private readonly directiveMustHaveOneOfTheKnownPropertiesMsg =
    'is_holder directive property must be one of [required, preferred]';

  private readonly sameSubjectFieldIdIsMandatoryMsg =
    'same_subject object must contain field_id property';
  private readonly sameSubjectFieldIdMustBeArrayOfStringsMsg =
    'same_subject object field_id property must be an array of strings';
  private readonly sameSubjectFieldIdMustCorrespondToFieldIdMsg =
    'same_subject field_id must correspond to a present field object id property';
  private readonly sameSubjectFieldMustContainDirectivePropertyMsg =
    'same_subject object must contain a directive property';
  private readonly sameSubjectDirectiveMustHaveOneOfTheKnownPropertiesMsg =
    'same_subject directive property must be one of [required, preferred]';

  constructor(parentTag: string) {
    super(parentTag, 'constraints');
  }

  public getValidations(constraints: Constraints): Validation<unknown>[] {
    return [
      {
        tag: this.getTag(),
        target: constraints?.limit_disclosure,
        predicate: ConstraintsVB.disclosureLimitShouldHaveKnownValue,
        message: this.disclosureLimitShouldHaveKnownValueMsg,
      },
      {
        tag: this.getTag(),
        target: constraints?.statuses,
        predicate: ConstraintsVB.statusShouldHaveKnownValue,
        message: this.statusShouldHaveKnownValueMsg,
      },
      {
        tag: this.getTag(),
        target: constraints?.statuses,
        predicate: ConstraintsVB.statusDirectiveShouldHaveKnownValue(),
        message: this.statusDirectiveShouldHaveKnownValueMsg,
      },
      {
        tag: this.getTag(),
        target: constraints?.subject_is_issuer,
        predicate: ConstraintsVB.shouldBeKnownOption,
        message: this.subjectIsIssuerShouldBeKnownValueMsg,
      },
      ...this.getIsHolderValidations(constraints?.is_holder),
      ...this.getSameSubjectValidations(constraints?.same_subject),
      ...new FieldsVB(this.getTag()).getValidations(constraints?.fields),
      ...this.fieldIdInSubjectMustCorrespondToFieldId(
        constraints,
        constraints?.is_holder,
        this.fieldIdInIsHolderMustCorrespondToFieldIdMsg
      ),
      ...this.fieldIdInSubjectMustCorrespondToFieldId(
        constraints,
        constraints?.same_subject,
        this.sameSubjectFieldIdMustCorrespondToFieldIdMsg
      ),
    ];
  }

  private static disclosureLimitShouldHaveKnownValue(
    limit_disclosure: Optionality
  ): boolean {
    return (
      limit_disclosure == null ||
      limit_disclosure === Optionality.Preferred ||
      limit_disclosure === Optionality.Required
    );
  }

  private static statusShouldHaveKnownValue(statuses: Statuses): boolean {
    return (
      statuses == null ||
      statuses.active != null ||
      statuses.revoked != null ||
      statuses.suspended != null
    );
  }

  private static statusDirectiveShouldHaveKnownValue(): Predicate<Statuses> {
    return (statuses: Statuses): boolean =>
      this.pdStatusShouldBeKnown(statuses?.active) &&
      this.pdStatusShouldBeKnown(statuses?.revoked) &&
      this.pdStatusShouldBeKnown(statuses?.suspended);
  }

  private static pdStatusShouldBeKnown(pdStatus: PdStatus): boolean {
    return (
      pdStatus == null ||
      pdStatus.directive === Directives.Allowed ||
      pdStatus.directive === Directives.Disallowed ||
      pdStatus.directive === Directives.Required
    );
  }

  private static shouldBeKnownOption(subject_is_issuer: Optionality): boolean {
    // TODO can be be extracted as a generic function
    return (
      subject_is_issuer == null ||
      subject_is_issuer == Optionality.Required ||
      subject_is_issuer == Optionality.Preferred
    );
  }

  getIsHolderValidations(
    subjects: Array<HolderSubject>
  ): Validation<unknown>[] {
    let validations: Validation<unknown>[] = [];
    for (let subjectInd = 0; subjectInd < subjects?.length; subjectInd++) {
      validations = [
        {
          tag: this.getMyTag(subjectInd),
          target: subjects[subjectInd],
          predicate: ConstraintsVB.fieldIdIsMandatory,
          message: this.fieldIdIsMandatoryMsg,
        },
        {
          tag: this.getMyTag(subjectInd),
          target: subjects[subjectInd]?.field_id,
          predicate: ConstraintsVB.fieldIdMustBeArray,
          message: this.fieldIdMustBeArrayOfStringsMsg,
        },
        {
          tag: this.getMyTag(subjectInd),
          target: subjects[subjectInd]?.field_id,
          predicate: ConstraintsVB.fieldIdMustBeArrayOfStrings,
          message: this.fieldIdMustBeArrayOfStringsMsg,
        },
        {
          tag: this.getMyTag(subjectInd),
          target: subjects[subjectInd]?.directive,
          predicate: ConstraintsVB.subjectMustContainDirectiveProperty,
          message: this.subjectMustContainDirectivePropertyMsg,
        },
        {
          tag: this.getMyTag(subjectInd),
          target: subjects[subjectInd]?.directive,
          predicate: ConstraintsVB.shouldBeKnownOption,
          message: this.directiveMustHaveOneOfTheKnownPropertiesMsg,
        },
      ];
    }
    return validations;
  }

  getSameSubjectValidations(
    subjects: Array<HolderSubject>
  ): Validation<unknown>[] {
    let validations: Validation<unknown>[] = [];
    for (let subjectInd = 0; subjectInd < subjects?.length; subjectInd++) {
      validations = [
        {
          tag: this.getMyTag(subjectInd),
          target: subjects[subjectInd],
          predicate: ConstraintsVB.fieldIdIsMandatory,
          message: this.sameSubjectFieldIdIsMandatoryMsg,
        },
        {
          tag: this.getMyTag(subjectInd),
          target: subjects[subjectInd]?.field_id,
          predicate: ConstraintsVB.fieldIdMustBeArray,
          message: this.fieldIdMustBeArrayOfStringsMsg,
        },
        {
          tag: this.getMyTag(subjectInd),
          target: subjects[subjectInd]?.field_id,
          predicate: ConstraintsVB.fieldIdMustBeArrayOfStrings,
          message: this.sameSubjectFieldIdMustBeArrayOfStringsMsg,
        },
        {
          tag: this.getMyTag(subjectInd),
          target: subjects[subjectInd]?.directive,
          predicate: ConstraintsVB.subjectMustContainDirectiveProperty,
          message: this.sameSubjectFieldMustContainDirectivePropertyMsg,
        },
        {
          tag: this.getMyTag(subjectInd),
          target: subjects[subjectInd]?.directive,
          predicate: ConstraintsVB.shouldBeKnownOption,
          message: this.sameSubjectDirectiveMustHaveOneOfTheKnownPropertiesMsg,
        },
      ];
    }
    return validations;
  }

  protected getMyTag(srInd: number) {
    // TODO extract to make it generic
    return this.parentTag + '.' + this.myTag + '[' + srInd + ']';
  }

  static fieldIdIsMandatory(subject: HolderSubject): boolean {
    return subject.field_id != null;
  }

  static fieldIdMustBeArray(field: unknown): boolean {
    return field == null || Array.isArray(field);
  }

  static fieldIdMustBeArrayOfStrings(fields: Array<string>): boolean {
    return (
      fields == null ||
      fields
        .filter((fieldId) => fieldId != null)
        .filter((fieldId) => typeof fieldId === 'string')
        .filter((fieldId) => fieldId.length > 0).length === fields.length
    );
  }

  static subjectMustContainDirectiveProperty(directive: Optionality): boolean {
    return typeof directive !== 'undefined';
  }

  fieldIdInSubjectMustCorrespondToFieldId(
    constraints: Constraints,
    subjects: Array<HolderSubject>,
    message: string
  ): Validation<unknown>[] {
    const missingFieldIds: string[] = [];

    if (subjects != null) {
      for (const subject of subjects) {
        if (subject?.field_id != null) {
          for (const fieldId of subject?.field_id) {
            if (!ConstraintsVB.isValidFieldId(constraints, fieldId)) {
              missingFieldIds.push(fieldId);
            }
          }
        }
      }
    }

    return missingFieldIds.length > 0
      ? [
          {
            tag: this.getTag(),
            target: missingFieldIds,
            predicate: (missingFieldIds: string[]) =>
              missingFieldIds.length === 0,
            message: message,
          },
        ]
      : [];
  }

  private static isValidFieldId(
    constraints: Constraints,
    fieldId: string
  ): boolean {
    return (
      fieldId == null ||
      fieldId.length === 0 ||
      constraints.fields?.map((field) => field.id).includes(fieldId)
    );
  }
}
