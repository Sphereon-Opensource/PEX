import { Constraints, Directives, Field, HolderSubject, Optionality, PdStatus, Statuses } from '@sphereon/pe-models';

import { Validation, ValidationPredicate } from '../core';

import { FieldsVB } from './fieldsVB';
import { ValidationBundler } from './validationBundler';

export class ConstraintsVB extends ValidationBundler<Field | HolderSubject | Constraints> {
  private readonly disclosureLimitShouldHaveKnownValueMsg = 'limit_disclosure should have known value';
  private readonly statusShouldHaveKnownValueMsg = 'Unknown status property';
  private readonly statusDirectiveShouldHaveKnownValueMsg = 'status directive should have known value';
  private readonly subjectIsIssuerShouldBeKnownValueMsg = 'subject_is_issuer should be known value';
  private readonly fieldIdIsMandatoryMsg = 'field_id property is mandatory';
  private readonly fieldIdMustBeArrayOfStringsMsg = 'field_id property must be an array of strings';
  private readonly fieldIdMustCorrespondToFieldIdMsg = 'field_id must correspond to a present field object id property';
  private readonly directivePropertyIsMandatoryMsg = 'directive property is mandatory';
  private readonly oneOfTheKnownDirectivePropertiesMandatoryMsg = 'directive property must be one of [required, preferred]';

  constructor(parentTag: string) {
    super(parentTag, 'constraints');
  }

  public getValidations(constraints: Constraints): (Validation<Constraints> | Validation<Field> | Validation<HolderSubject>)[] {
    let validations: (Validation<Constraints> | Validation<Field> | Validation<HolderSubject>)[] = [];
    if (constraints) {
      validations = [
        {
          tag: this.getTag(),
          target: constraints,
          predicate: (constraints: Constraints) => ConstraintsVB.disclosureLimitShouldHaveKnownValue(constraints.limit_disclosure),
          message: this.disclosureLimitShouldHaveKnownValueMsg,
        },
        {
          tag: this.getTag(),
          target: constraints,
          predicate: (constraints: Constraints) => ConstraintsVB.statusShouldHaveKnownValue(constraints.statuses),
          message: this.statusShouldHaveKnownValueMsg,
        },
        {
          tag: this.getTag(),
          target: constraints,
          predicate: ConstraintsVB.statusDirectiveShouldHaveKnownValue(),
          message: this.statusDirectiveShouldHaveKnownValueMsg,
        },
        {
          tag: this.getTag(),
          target: constraints,
          predicate: (constraints: Constraints) => ConstraintsVB.shouldBeKnownOption(constraints.is_holder),
          message: this.subjectIsIssuerShouldBeKnownValueMsg,
        },
        {
          tag: this.getTag(),
          target: constraints,
          predicate: (constraints: Constraints) => this.fieldIdInSubjectMustCorrespondToFieldId(constraints, constraints.is_holder),
          message: this.fieldIdMustCorrespondToFieldIdMsg,
        },
        {
          tag: this.getTag(),
          target: constraints,
          predicate: (constraints: Constraints) => this.fieldIdInSubjectMustCorrespondToFieldId(constraints, constraints.same_subject),
          message: this.fieldIdMustCorrespondToFieldIdMsg,
        },
        ...this.getSubjectsValidations(constraints?.is_holder),
        ...this.getSubjectsValidations(constraints?.same_subject),
        ...this.getFieldsValidations(constraints),
      ];
    }
    return validations;
  }

  private getFieldsValidations(constraints: Constraints): Validation<Field>[] {
    if (constraints?.fields?.length) {
      return new FieldsVB(this.getTag()).getValidations(constraints.fields);
    }
    return [];
  }

  private static disclosureLimitShouldHaveKnownValue(limit_disclosure?: Optionality): boolean {
    return !limit_disclosure || limit_disclosure === Optionality.Preferred || limit_disclosure === Optionality.Required;
  }

  private static statusShouldHaveKnownValue(statuses: Statuses | undefined): boolean {
    return statuses == null || statuses.active != null || statuses.revoked != null || statuses.suspended != null;
  }

  private static statusDirectiveShouldHaveKnownValue(): ValidationPredicate<Constraints> {
    return (constraints: Constraints): boolean =>
      this.pdStatusShouldBeKnown(constraints?.statuses?.active) &&
      this.pdStatusShouldBeKnown(constraints?.statuses?.revoked) &&
      this.pdStatusShouldBeKnown(constraints?.statuses?.suspended);
  }

  private static pdStatusShouldBeKnown(pdStatus: PdStatus | undefined): boolean {
    return (
      !pdStatus ||
      pdStatus.directive === Directives.Allowed ||
      pdStatus.directive === Directives.Disallowed ||
      pdStatus.directive === Directives.Required
    );
  }

  private static shouldBeKnownOption(subjects?: HolderSubject[]): boolean {
    if (subjects) {
      return (
        subjects.filter((subject: HolderSubject) => subject.directive !== Optionality.Preferred && subject.directive !== Optionality.Required)
          .length === 0
      );
    }
    return true;
  }

  getSubjectsValidations(holderSubjects?: HolderSubject[]): Validation<HolderSubject>[] {
    if (holderSubjects) {
      let validations: Validation<HolderSubject>[] = [];
      for (let subjectInd = 0; subjectInd < holderSubjects.length; subjectInd++) {
        validations = [
          {
            tag: this.getMyTag(subjectInd),
            target: holderSubjects[subjectInd],
            predicate: (subject: HolderSubject) => Array.isArray(subject.field_id),
            message: this.fieldIdMustBeArrayOfStringsMsg,
          },
          {
            tag: this.getMyTag(subjectInd),
            target: holderSubjects[subjectInd],
            predicate: (subject: HolderSubject) => !!subject.field_id,
            message: this.fieldIdIsMandatoryMsg,
          },
          {
            tag: this.getMyTag(subjectInd),
            target: holderSubjects[subjectInd],
            predicate: (subject: HolderSubject) => subject.field_id.length === subject.field_id.filter((id) => typeof id === 'string').length,
            message: this.fieldIdMustBeArrayOfStringsMsg,
          },
          {
            tag: this.getMyTag(subjectInd),
            target: holderSubjects[subjectInd],
            predicate: (subject: HolderSubject) => subject.directive !== undefined,
            message: this.directivePropertyIsMandatoryMsg,
          },
          {
            tag: this.getMyTag(subjectInd),
            target: holderSubjects[subjectInd],
            predicate: (subject: HolderSubject) => subject.directive === Optionality.Preferred || subject.directive === Optionality.Required,
            message: this.oneOfTheKnownDirectivePropertiesMandatoryMsg,
          },
        ];
      }
      return validations;
    }
    return [];
  }

  protected getMyTag(srInd: number) {
    // TODO extract to make it generic
    return this.parentTag + '.' + this.myTag + '[' + srInd + ']';
  }

  fieldIdInSubjectMustCorrespondToFieldId(constraints: Constraints, subjects?: HolderSubject[]): boolean {
    if (subjects) {
      for (const subject of subjects) {
        for (const fieldId of subject.field_id) {
          if (!ConstraintsVB.isValidFieldId(constraints, fieldId)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private static isValidFieldId(constraints: Constraints, fieldId: string): boolean {
    if (constraints?.fields) {
      return constraints.fields.map((field: Field) => field.id).includes(fieldId);
    }
    return false;
  }
}
