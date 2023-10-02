import {
  ConstraintsV1,
  FieldV1,
  Format,
  HolderSubject,
  InputDescriptorV1,
  JwtObject,
  LdpObject,
  PresentationDefinitionV1,
  SubmissionRequirement,
} from '@sphereon/pex-models';

import { Validation, ValidationPredicate } from '../core';
import { JwtAlgos } from '../core/jwtAlgos';
import { LdpTypes } from '../core/ldpTypes';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import validatePDv1 from '../validatePDv1.js';

import { InputDescriptorsV1VB } from './inputDescriptorsV1VB';
import { SubmissionRequirementVB } from './submissionRequirementVB';
import { ValidationBundler } from './validationBundler';

export class PresentationDefinitionV1VB extends ValidationBundler<
  FieldV1 | HolderSubject | ConstraintsV1 | InputDescriptorV1 | PresentationDefinitionV1 | SubmissionRequirement
> {
  constructor(parentTag: string) {
    super(parentTag, 'presentation_definition');
  }

  public getValidations(
    pd: PresentationDefinitionV1,
  ): (
    | Validation<FieldV1>
    | Validation<HolderSubject>
    | Validation<ConstraintsV1>
    | Validation<InputDescriptorV1>
    | Validation<InputDescriptorV1[]>
    | Validation<PresentationDefinitionV1>
    | Validation<SubmissionRequirement>
  )[] {
    if (pd.submission_requirements) {
      return [
        ...this.myValidations(pd),
        ...new InputDescriptorsV1VB(this.myTag).getValidations(pd.input_descriptors),
        ...new SubmissionRequirementVB(this.myTag).getValidations(pd.submission_requirements),
      ];
    } else {
      return [...this.myValidations(pd), ...new InputDescriptorsV1VB(this.myTag).getValidations(pd.input_descriptors)];
    }
  }

  private myValidations(pd: PresentationDefinitionV1): Validation<PresentationDefinitionV1>[] {
    return [
      // E Section 4.B   : The Input Descriptors (#term:input-descriptors) required for submission are described by the submission_requirements. If no submission_requirements value is present, all inputs listed in the input_descriptors array are required for submission.
      {
        tag: this.getTag(),
        target: pd,
        predicate: (pd) => pd != null,
        message: 'presentation_definition should be non null.',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate: this.shouldBeAsPerJsonSchema(),
        message: 'presentation_definition should be as per json schema.',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate: (pd: PresentationDefinitionV1) => PresentationDefinitionV1VB.nonEmptyString(pd?.id),
        message: 'id should not be empty',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate: (pd: PresentationDefinitionV1) => PresentationDefinitionV1VB.optionalNonEmptyString(pd?.name),
        message: 'name should be a non-empty string',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate: (pd: PresentationDefinitionV1) => PresentationDefinitionV1VB.optionalNonEmptyString(pd?.purpose),
        message: 'purpose should be a non-empty string',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate: (pd: PresentationDefinitionV1) => PresentationDefinitionV1VB.formatValuesShouldNotBeEmpty(pd?.format),
        message: 'formats values should not empty',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate: (pd: PresentationDefinitionV1) => PresentationDefinitionV1VB.formatValuesShouldBeAmongKnownValues(pd?.format),
        message: 'formats should only have known identifiers for alg or proof_type',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate: (pd: PresentationDefinitionV1) => PresentationDefinitionV1VB.groupShouldMatchSubmissionRequirements(pd),
        message: 'input descriptor group should match the from in submission requirements.',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate: (pd: PresentationDefinitionV1) => PresentationDefinitionV1VB.shouldNotHaveFrameProperty(pd),
        message: 'input descriptor should not have frame property.',
      },
    ];
  }

  private static optionalNonEmptyString(str: string | undefined): boolean {
    // TODO extract to generic utils or use something like lodash
    return str == null || str.length > 0;
  }

  private static nonEmptyString(id: string): boolean {
    // TODO extract to generic utils or use something like lodash
    return id != null && id.length > 0;
  }

  private static formatValuesShouldNotBeEmpty(format: Format | undefined): boolean {
    let areExpectedValuesPresent = true;

    if (format?.jwt != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.jwt.alg?.length > 0;
    }
    if (format?.jwt_vc != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.jwt_vc.alg?.length > 0;
    }
    if (format?.jwt_vc_json != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.jwt_vc_json.alg?.length > 0;
    }
    if (format?.jwt_vp != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.jwt_vp.alg?.length > 0;
    }
    if (format?.ldp != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.ldp.proof_type?.length > 0;
    }
    if (format?.ldp_vc != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.ldp_vc.proof_type?.length > 0;
    }
    if (format?.ldp_vp != null) {
      areExpectedValuesPresent = areExpectedValuesPresent && format.ldp_vp.proof_type?.length > 0;
    }

    return areExpectedValuesPresent;
  }

  private static formatValuesShouldBeAmongKnownValues(format: Format | undefined): boolean {
    let unknownProofsAndAlgorithms: string[] = [];

    if (format) {
      const jwtAlgos: string[] = JwtAlgos.getJwtAlgos();
      const ldpTypes: string[] = LdpTypes.getLdpTypes();
      unknownProofsAndAlgorithms = [];
      for (const [key, value] of Object.entries(format)) {
        if (key.startsWith('jwt')) {
          unknownProofsAndAlgorithms.push(...PresentationDefinitionV1VB.isJWTAlgoKnown(value, jwtAlgos));
        } else {
          unknownProofsAndAlgorithms.push(...PresentationDefinitionV1VB.isLDPProofKnown(value, ldpTypes));
        }
      }
    }
    return unknownProofsAndAlgorithms.length === 0;
  }

  private static isJWTAlgoKnown(jwtObject: JwtObject, jwtAlgos: string[]): string[] {
    const unknownAlgorithms: string[] = [];
    if (jwtObject != null && jwtObject.alg != null) {
      for (const jwtAlgo of jwtObject.alg) {
        if (!jwtAlgos.includes(jwtAlgo)) {
          unknownAlgorithms.push(jwtAlgo);
        }
      }
    }
    return unknownAlgorithms;
  }

  private static isLDPProofKnown(ldpObject: LdpObject, ldpTypes: string[]): string[] {
    const unknownProofType: string[] = [];
    if (ldpObject != null && ldpObject.proof_type != null) {
      for (const ldpProof of ldpObject.proof_type) {
        if (!ldpTypes.includes(ldpProof)) {
          unknownProofType.push(ldpProof);
        }
      }
    }
    return unknownProofType;
  }

  private static groupShouldMatchSubmissionRequirements(pd: PresentationDefinitionV1): boolean {
    if (pd.submission_requirements != null && pd.submission_requirements.length > 0) {
      const groups: string[] = [];
      pd.input_descriptors.forEach((inDesc: InputDescriptorV1) => {
        if (inDesc.group) {
          groups.push(...inDesc.group);
        }
      });
      const groupStrings: Set<string> = new Set<string>(groups);

      const fromValues: string[] = [];
      PresentationDefinitionV1VB.flatten(pd.submission_requirements).forEach((srs: SubmissionRequirement) => {
        if (srs.from) {
          if (Array.isArray(srs.from)) {
            fromValues.push(...srs.from);
          } else {
            fromValues.push(srs.from);
          }
        }
      });

      const fromValueStrings: Set<string> = new Set<string>(fromValues);

      const difference = new Set([...fromValueStrings].filter((x) => x != null && x.length > 0 && !groupStrings.has(x)));

      return difference.size === 0;
    }

    return true;
  }

  private static flatten(srs: SubmissionRequirement[]): SubmissionRequirement[] {
    return srs?.reduce(
      (accumulator: SubmissionRequirement[], submissionRequirement: SubmissionRequirement) =>
        accumulator.concat(
          Array.isArray(submissionRequirement.from_nested) ? this.flatten(submissionRequirement.from_nested) : submissionRequirement,
        ),
      [],
    );
  }

  private shouldBeAsPerJsonSchema(): ValidationPredicate<PresentationDefinitionV1> {
    // TODO can be be extracted as a generic function
    return (presentationDefinition: PresentationDefinitionV1): boolean => {
      return validatePDv1({ presentation_definition: presentationDefinition });
    };
  }

  private static shouldNotHaveFrameProperty(pd: PresentationDefinitionV1) {
    return !pd['frame' as keyof PresentationDefinitionV1];
  }
}
