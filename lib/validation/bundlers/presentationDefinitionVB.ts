import fs from 'fs';

import {
  Format,
  JwtObject,
  LdpObject,
  PresentationDefinition,
  SubmissionRequirement,
} from '@sphereon/pe-models';
import Ajv from 'ajv';

import { Predicate, Validation } from '../core';

import { SubmissionRequirementVB } from './SubmissionRequirementVB';
import { InputDescriptorsVB } from './inputDescriptorsVB';
import { ValidationBundler } from './validationBundler';

export class PresentationDefinitionVB extends ValidationBundler<PresentationDefinition> {
  private ajv: Ajv;

  constructor(parentTag: string) {
    super(parentTag, 'presentation_definition');
    this.ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  }

  public getValidations(pd: PresentationDefinition): Validation<unknown>[] {
    return [
      ...this.myValidations(pd),
      ...new InputDescriptorsVB(this.myTag).getValidations(
        pd.input_descriptors
      ),
      ...new SubmissionRequirementVB(this.myTag).getValidations(
        pd.submission_requirements
      ),
    ];
  }

  private myValidations(pd: PresentationDefinition): Validation<unknown>[] {
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
        target: pd?.id,
        predicate: PresentationDefinitionVB.nonEmptyString,
        message: 'id should not be empty',
      },
      {
        tag: this.getTag(),
        target: pd?.id,
        predicate: PresentationDefinitionVB.isUUID,
        message: 'id should preferably be UUID',
      },
      {
        tag: this.getTag(),
        target: pd?.name,
        predicate: PresentationDefinitionVB.optionalNonEmptyString,
        message: 'name should be a non-empty string',
      },
      {
        tag: this.getTag(),
        target: pd?.purpose,
        predicate: PresentationDefinitionVB.optionalNonEmptyString,
        message: 'purpose should be a non-empty string',
      },
      {
        tag: this.getTag(),
        target: pd?.format,
        predicate: PresentationDefinitionVB.formatValuesShouldNotBeEmpty,
        message: 'formats values should not empty',
      },
      {
        tag: this.getTag(),
        target: pd?.format,
        predicate:
          PresentationDefinitionVB.formatValuesShouldBeAmongKnownValues,
        message:
          'formats should only have known identifiers for alg or proof_type',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate:
          PresentationDefinitionVB.groupShouldMatchSubmissionRequirements,
        message:
          'input descriptor group should match the from in submission requirements.',
      },
    ];
  }

  private static isUUID(uuid) {
    // TODO extract to generic utils or use something like lodash
    const s = '' + uuid;

    const testedID = s.match(
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    );
    if (testedID === null) {
      return true; // TODO This should result in a warning. Currently it is allowing it.
    }
    return true;
  }

  private static optionalNonEmptyString(str: string): boolean {
    // TODO extract to generic utils or use something like lodash
    return str == null || str.length > 0;
  }

  private static nonEmptyString(id: string): boolean {
    // TODO extract to generic utils or use something like lodash
    return id != null && id.length > 0;
  }

  private static formatValuesShouldNotBeEmpty(format: Format): boolean {
    let areExpectedValuesPresent = true;

    if (format?.jwt != null) {
      areExpectedValuesPresent &&= format.jwt.alg?.length > 0;
    }
    if (format?.jwt_vc != null) {
      areExpectedValuesPresent &&= format.jwt_vc.alg?.length > 0;
    }
    if (format?.jwt_vp != null) {
      areExpectedValuesPresent &&= format.jwt_vp.alg?.length > 0;
    }
    if (format?.ldp != null) {
      areExpectedValuesPresent &&= format.ldp.proof_type?.length > 0;
    }
    if (format?.ldp_vc != null) {
      areExpectedValuesPresent &&= format.ldp_vc.proof_type?.length > 0;
    }
    if (format?.ldp_vp != null) {
      areExpectedValuesPresent &&= format.ldp_vp.proof_type?.length > 0;
    }

    return areExpectedValuesPresent;
  }

  private static formatValuesShouldBeAmongKnownValues(format: Format): boolean {
    let unknownProofsAndAlgorithms: string[] = [];

    if (format != null) {
      const jwtAlgos: string[] = PresentationDefinitionVB.getFile(
        './resources/jwt_algos.json'
      ).alg;
      const ldpTypes: string[] = PresentationDefinitionVB.getFile(
        './resources/ldp_types.json'
      ).proof_types;

      unknownProofsAndAlgorithms = [
        ...PresentationDefinitionVB.isJWTAlgoKnown(format.jwt, jwtAlgos),
        ...PresentationDefinitionVB.isJWTAlgoKnown(format.jwt_vc, jwtAlgos),
        ...PresentationDefinitionVB.isJWTAlgoKnown(format.jwt_vp, jwtAlgos),

        ...PresentationDefinitionVB.isLDPProofKnown(format.ldp, ldpTypes),
        ...PresentationDefinitionVB.isLDPProofKnown(format.ldp_vc, ldpTypes),
        ...PresentationDefinitionVB.isLDPProofKnown(format.ldp_vp, ldpTypes),
      ];
    }
    return unknownProofsAndAlgorithms.length === 0;
  }

  private static isJWTAlgoKnown(
    jwtObject: JwtObject,
    jwtAlgos: string[]
  ): string[] {
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

  private static isLDPProofKnown(
    ldpObject: LdpObject,
    ldpTypes: string[]
  ): string[] {
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

  private static groupShouldMatchSubmissionRequirements(
    pd: PresentationDefinition
  ): boolean {
    if (
      pd.submission_requirements != null &&
      pd.submission_requirements.length > 0
    ) {
      const groups = pd.input_descriptors
        .map((inDesc) => inDesc?.group)
        .filter((groups, index) => groups != null && groups[index] != null)
        .map((groups, index) => groups[index]);
      const groupStrings: Set<string> = new Set<string>(groups);

      const fromValues = PresentationDefinitionVB.flatten(
        pd.submission_requirements
      )
        .map((srs) => srs?.from)
        .filter(
          (fromValues, index) => fromValues != null && fromValues[index] != null
        )
        .map((fromValues, index) => fromValues[index]);

      const fromValueStrings: Set<string> = new Set<string>(fromValues);

      const difference = new Set(
        [...fromValueStrings].filter(
          (x) => x != null && x.length > 0 && !groupStrings.has(x)
        )
      );

      return difference.size === 0;
    }

    return true;
  }

  private static flatten(srs: SubmissionRequirement[]) {
    return srs?.reduce(
      (accumulator, submissionRequirement) =>
        accumulator.concat(
          Array.isArray(submissionRequirement.from_nested)
            ? this.flatten(
                submissionRequirement.from_nested as SubmissionRequirement[]
              )
            : submissionRequirement
        ),
      []
    );
  }

  private shouldBeAsPerJsonSchema(): Predicate<unknown> {
    return (presentationDefinition: PresentationDefinition): boolean => {
      const presentationDefinitionSchema = JSON.parse(
        fs.readFileSync(
          'json_schemas/presentation_definition.schema.json',
          'utf-8'
        )
      );

      const validate = this.ajv.compile(presentationDefinitionSchema);
      const valid = validate(presentationDefinition);

      if (!valid) {
        console.log(validate.errors);
        return false;
      }

      return true;
    };
  }

  private static getFile(path: string) {
    // TODO extract to generic utils or use something like lodash
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
  }
}
