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

  public getValidations(psWrapper: unknown): Validation[] {
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

  private getSchemaValidations(psWrapper: unknown) {
    const schemaValidations = [];
    this.getPS(psWrapper).forEach((ps, index) => schemaValidations.push(this.getSchemaValidation(index, ps)));

    return schemaValidations;
  }

  private getSchemaValidation(index: number, ps) {
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

  private static shouldConformToSchema(): ValidationPredicate<unknown> {
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

  private getPSValidations(psWrapper) {
    const validations = [];
    this.getPS(psWrapper).forEach((ps) =>
      validations.push(...new PresentationSubmissionVB(this.getTag()).getValidations(ps))
    );
    return validations;
  }

  private getPS(psWrapper) {
    const targets = [];
    if (psWrapper != null) {
      if (psWrapper.presentation_submission != null) {
        targets.push(psWrapper.presentation_submission);
      }

      if (psWrapper['presentations~attach'] != null) {
        targets.push(...this.getFromDidComLocation(psWrapper));
      }

      if (psWrapper.data != null) {
        targets.push(PresentationSubmissionWrapperVB.getFromChapiLocation(psWrapper));
      }
    }
    return targets;
  }

  private static getFromChapiLocation(psWrapper) {
    if (psWrapper.data?.presentation_submission != null) {
      return psWrapper?.data?.presentation_submission;
    }
    return null;
  }

  private getFromDidComLocation(psWrapper) {
    const targets = [];
    psWrapper['presentations~attach'].forEach((attachment) => {
      if (attachment.data?.json?.presentation_submission != null) {
        targets.push(attachment.data?.json?.presentation_submission);
      }
    });
    return targets;
  }
}
