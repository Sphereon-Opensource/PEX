import { PresentationSubmission } from '@sphereon/pe-models';
import Ajv from 'ajv';

import { Validation, ValidationPredicate } from '../core';
import { PresentationSubmissionSchema } from '../core/presentationSubmissionSchema';

import { PresentationSubmissionVB } from './presentationSubmissionVB';
import { ValidationBundler } from './validationBundler';

export class PresentationSubmissionWrapperVB extends ValidationBundler<unknown> {
  constructor(parentTag: string) {
    super(parentTag, 'psWrapper');
  }

  public getValidations(psWrapper: unknown): Validation<unknown>[] {
    return [
      {
        tag: this.getTag(),
        target: psWrapper,
        predicate: (psWrapper) => psWrapper != null,
        message: 'ps_wrapper should be non null.',
      },
      {
        tag: this.getTag(),
        target: psWrapper,
        predicate: (psWrapper) => !(psWrapper != null && this.getPS(psWrapper).length == 0),
        message: 'presentation submission root object should be one of the known locations',
      },
      ...this.getSchemaValidations(psWrapper),
      ...this.getPSValidations(psWrapper),
    ];
  }

  private getSchemaValidations(psWrapper: unknown): Validation<any>[] {
    const schemaValidations: Validation<any>[] = [];
    this.getPS(psWrapper).forEach((ps, index) => schemaValidations.push(this.getSchemaValidation(index, ps)));

    return schemaValidations;
  }

  private getSchemaValidation(index: number, ps: any) {
    return {
      tag: this.getMyTag(index),
      target: { presentation_submission: ps },
      predicate: PresentationSubmissionWrapperVB.shouldConformToSchema(),
      message: 'presentation_submission should be as per json schema.',
    };
  }

  protected getMyTag(srInd: number) {
    // TODO extract to make it generic
    return this.parentTag + '.' + this.myTag + '[' + srInd + ']';
  }

  private static shouldConformToSchema(): ValidationPredicate<any> {
    // TODO can be be extracted as a generic function
    return (presentationSubmission: PresentationSubmission): boolean => {
      let isValid = true;
      if (presentationSubmission != null) {
        const presentationSubmissionSchema = PresentationSubmissionSchema.getPresentationSubmissionSchema();

        const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
        const validate = ajv.compile(presentationSubmissionSchema);
        isValid = validate(presentationSubmission);

        if (!isValid) {
          // console.log(validate.errors);
        }
      }
      return isValid;
    };
  }

  private getPSValidations(psWrapper: any): Validation<any>[] {
    const validations: Validation<any>[] = [];
    this.getPS(psWrapper).forEach((ps) =>
      validations.push(...new PresentationSubmissionVB(this.getTag()).getValidations(ps))
    );
    return validations;
  }

  private getPS(psWrapper: any): PresentationSubmission[] {
    const targets: PresentationSubmission[] = [];
    if (psWrapper) {
      if (psWrapper.presentation_submission) {
        targets.push(psWrapper.presentation_submission);
      }

      if (psWrapper['presentations~attach']) {
        targets.push(...this.getFromDidComLocation(psWrapper));
      }

      if (psWrapper.data) {
        targets.push(PresentationSubmissionWrapperVB.getFromChapiLocation(psWrapper));
      }
    }
    return targets;
  }

  private static getFromChapiLocation(psWrapper: any): PresentationSubmission {
    return psWrapper?.data?.presentation_submission;
  }

  private getFromDidComLocation(psWrapper: any): PresentationSubmission[] {
    const targets: PresentationSubmission[] = [];
    psWrapper['presentations~attach'].forEach((attachment: any) => {
      if (attachment.data?.json?.presentation_submission) {
        targets.push(attachment.data?.json?.presentation_submission);
      }
    });
    return targets;
  }
}
