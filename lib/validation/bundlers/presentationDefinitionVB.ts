import fs from 'fs';

import {
  LdpObject,
  PresentationDefinition,
  SubmissionRequirement,
} from '@sphereon/pe-models';
import { JwtObject } from '@sphereon/pe-models/model/jwtObject';
import Ajv from 'ajv';

import { Predicate, Validation } from '../core';

import { InputDescriptorsVB } from './inputDescriptorsVB';
import { ValidationBundler } from './validationBundler';

export class PresentationDefinitionVB extends ValidationBundler<PresentationDefinition> {
  private ajv: Ajv;

  constructor(parentTag: string) {
    super(parentTag, 'presentation_definition');
    this.ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  }

  public getValidations(pd: PresentationDefinition): Validation<unknown>[] {
    return this.myValidations(pd).concat(
      new InputDescriptorsVB(this.myTag).getValidations(pd.input_descriptors)
    );
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
        predicate: PresentationDefinitionVB.shouldBeNonEmptyStrings,
        message: 'formats should not have empty strings in alg or proof_type',
      },
      {
        tag: this.getTag(),
        target: pd,
        predicate:
          PresentationDefinitionVB.groupShouldMatchSubscriptionRequirements,
        message:
          'input descriptor group should match the from in subscription requirements.',
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

  private static optionalNonEmptyString(name: string): boolean {
    // TODO extract to generic utils or use something like lodash
    return name == null || name.length > 0;
  }

  private static nonEmptyString(id: string): boolean {
    // TODO extract to generic utils or use something like lodash
    return id != null && id.length > 0;
  }

  private static reducer() {
    return (accumulator: boolean, currentValue: boolean): boolean =>
      accumulator && currentValue;
  }

  private static shouldBeNonEmptyStrings(pd: PresentationDefinition): boolean {
    let hasAnEmptyString = true;
    if (pd?.format != null) {
      const format = pd.format;

      hasAnEmptyString = PresentationDefinitionVB.jwtAlgosShouldBeNonEmpty(
        format?.jwt
      );
      hasAnEmptyString &&= PresentationDefinitionVB.jwtAlgosShouldBeNonEmpty(
        format?.jwt_vc
      );
      hasAnEmptyString &&= PresentationDefinitionVB.jwtAlgosShouldBeNonEmpty(
        format?.jwt_vp
      );

      hasAnEmptyString &&= PresentationDefinitionVB.ldpAlgosShouldBeNonEmpty(
        format?.ldp
      );
      hasAnEmptyString &&= PresentationDefinitionVB.ldpAlgosShouldBeNonEmpty(
        format?.ldp_vc
      );
      hasAnEmptyString &&= PresentationDefinitionVB.ldpAlgosShouldBeNonEmpty(
        format?.ldp_vp
      );
    }
    return hasAnEmptyString;
  }

  private static jwtAlgosShouldBeNonEmpty(jwtObj: JwtObject) {
    return jwtObj?.alg
      ?.map((str) => str?.length > 0)
      .reduce(PresentationDefinitionVB.reducer());
  }

  private static ldpAlgosShouldBeNonEmpty(ldpObj: LdpObject) {
    return ldpObj?.proof_type
      ?.map((str) => str?.length > 0)
      .reduce(PresentationDefinitionVB.reducer());
  }

  private static groupShouldMatchSubscriptionRequirements(
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
          x => x != null && x.length > 0 && !groupStrings.has(x)
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
}
