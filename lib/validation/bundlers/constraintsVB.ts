import { Constraints, Directives, Optionality, Statuses } from 'pe-models';
import { HolderSubject } from 'pe-models/model/holderSubject';
import { PdStatus } from 'pe-models/model/pdStatus';

import { Predicate, Validation } from '../core';

import { FieldsVB } from './fieldsVB';
import { ValidationBundler } from './validationBundler';

export class ConstraintsVB extends ValidationBundler<Constraints> {
  private readonly disclosureLimitShouldHaveKnownValueMsg =
    'limit_disclosure should have known value';
  private readonly statusShouldHaveKnownValueMsg =
    'status should have known value';
  private readonly statusDirectiveShouldHaveKnownValueMsg =
    'status directive should have known value';
  private readonly subjectIsIssuerShouldBeKnownValueMsg =
    'subject_is_issuer should be known value';
  private readonly isHolderShouldBeOfCorrectStructureMsg =
    'is_holder should be of correct structure';
  private readonly subjectShouldBeOfCorrectStructureMsg =
    'subject should be of correct structure';

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
      {
        tag: this.getTag(),
        target: constraints?.is_holder,
        predicate: ConstraintsVB.subjectShouldBeOfCorrectStructure(),
        message: this.isHolderShouldBeOfCorrectStructureMsg,
      },
      {
        tag: this.getTag(),
        target: constraints?.same_subject,
        predicate: ConstraintsVB.subjectShouldBeOfCorrectStructure(),
        message: this.subjectShouldBeOfCorrectStructureMsg,
      },
      ...new FieldsVB(this.getTag()).getValidations(constraints?.fields),
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

  private static subjectShouldBeOfCorrectStructure(): Predicate<
    HolderSubject[]
  > {
    return (subject: Array<HolderSubject>): boolean =>
      subject == null ||
      (Array.isArray(subject) &&
        subject.filter(
          (isHolder) =>
            Array.isArray(isHolder.field_id) &&
            isHolder.field_id.filter(
              (field) =>
                field != null && typeof field === 'string' && field.length > 0
            ).length === isHolder.field_id.length &&
            this.shouldBeKnownOption(isHolder.directive)
        ).length === subject.length);
  }
}
