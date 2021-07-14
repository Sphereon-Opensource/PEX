import { PresentationSubmission } from '@sphereon/pe-models';
import { Descriptor } from '@sphereon/pe-models/model/descriptor';
import jp from 'jsonpath';

import { Checked, Status } from '../../ConstraintUtils';
import { Validation } from '../core';

import { ValidationBundler } from './validationBundler';

export class PresentationSubmissionVB extends ValidationBundler<PresentationSubmission> {
  constructor(parentTag: string) {
    super(parentTag, 'presentation_submission');
  }

  public getValidations(ps: PresentationSubmission): Validation<unknown>[] {
    return [
      {
        tag: this.getTag(),
        target: ps,
        predicate: (ps) => ps != null,
        message: 'presentation_submission should be non null.',
      },
      {
        tag: this.getTag(),
        target: ps?.id,
        predicate: PresentationSubmissionVB.nonEmptyString,
        message: 'id should not be empty',
      },
      {
        tag: this.getTag(),
        target: ps?.definition_id,
        predicate: PresentationSubmissionVB.nonEmptyString,
        message: 'presentation_definition_id should not be empty',
      },
      {
        tag: this.getTag(),
        target: ps?.descriptor_map,
        predicate: PresentationSubmissionVB.descriptorMapMustBePresent,
        message: 'descriptor_map should be a non-empty list',
      },
      {
        tag: this.getTag(),
        target: ps?.descriptor_map,
        predicate: PresentationSubmissionVB.idMustBeSameForEachLevelOfNesting,
        message: 'each descriptor should have a one id in it, on all levels',
      },
      {
        tag: this.getTag(),
        target: ps?.descriptor_map,
        predicate: PresentationSubmissionVB.formatsShouldBeKnown,
        message: 'each format should be one of the known format',
      },
      {
        tag: this.getTag(),
        target: ps?.descriptor_map,
        predicate: PresentationSubmissionVB.pathsShouldBeValidJsonPaths,
        message: 'each path should be a valid jsonPath',
      },
    ];
  }

  private static nonEmptyString(id: string): boolean {
    // TODO extract to generic utils or use something like lodash
    return id != null && id.length > 0;
  }

  private static descriptorMapMustBePresent(descriptor_map: Array<Descriptor>): boolean {
    return descriptor_map != null && descriptor_map.length > 0;
  }

  private static idMustBeSameForEachLevelOfNesting(descriptor_map: Array<Descriptor>): boolean {
    let doesEachDescriptorHasOneIdOnAllLevelsOfNesting = true;
    if (descriptor_map != null) {
      for (let i = 0; i < descriptor_map.length; i++) {
        doesEachDescriptorHasOneIdOnAllLevelsOfNesting &&= PresentationSubmissionVB.isIdSameForEachLevelOfNesting(
          descriptor_map[i],
          descriptor_map[i].id
        );
      }
    }

    return doesEachDescriptorHasOneIdOnAllLevelsOfNesting;
  }

  private static isIdSameForEachLevelOfNesting(descriptor: Descriptor, id: string): boolean {
    let isSame = true;
    if (descriptor != null && descriptor.path_nested != null) {
      if (descriptor.path_nested.id == id) {
        isSame &&= PresentationSubmissionVB.isIdSameForEachLevelOfNesting(descriptor.path_nested, id); // WARNING : Specification does not allow any bounds. So, no checks against stackoverflow due to unbounded recursion.
      } else {
        isSame = false;
      }
    }

    return isSame;
  }

  private static formatsShouldBeKnown(descriptor_map: Array<Descriptor>): boolean {
    let isProofFormatKnown = true;
    if (descriptor_map != null) {
      const formats: string[] = ['jwt', 'jwt_vc', 'jwt_vp', 'ldp', 'ldp_vc', 'ldp_vp'];

      for (let i = 0; i < descriptor_map.length; i++) {
        isProofFormatKnown = PresentationSubmissionVB.formatShouldBeKnown(descriptor_map[i], formats);
      }
    }

    return isProofFormatKnown;
  }

  private static formatShouldBeKnown(descriptor: Descriptor, formats: string[]): boolean {
    let isProofFormatKnown = true;

    if (descriptor != null) {
      isProofFormatKnown = formats.includes(descriptor.format);
    }

    if (descriptor.path_nested != null) {
      isProofFormatKnown &&= PresentationSubmissionVB.formatShouldBeKnown(descriptor.path_nested, formats); // WARNING : Specification does not allow any bounds. So, no checks against stackoverflow due to unbounded recursion.
    }

    return isProofFormatKnown;
  }

  private static pathsShouldBeValidJsonPaths(descriptor_map: Array<Descriptor>): boolean {
    let isPathValidJsonPath = true;
    if (descriptor_map != null) {
      for (let i = 0; i < descriptor_map.length; i++) {
        isPathValidJsonPath = PresentationSubmissionVB.pathShouldBeValid(descriptor_map[i], []);
      }
    }

    return isPathValidJsonPath;
  }

  private static pathShouldBeValid(descriptor: Descriptor, invalidPaths: string[]): boolean {
    if (descriptor != null) {
      try {
        jp.parse(descriptor.path);
      } catch (err) {
        invalidPaths.push(descriptor.path);
      }

      if (descriptor.path_nested != null) {
        PresentationSubmissionVB.pathShouldBeValid(descriptor.path_nested, invalidPaths); // WARNING : Specification does not allow any bounds. So, no checks against stackoverflow due to unbounded recursion.
      }
    }

    if (invalidPaths.length > 0) {
      throw new Checked('', Status.ERROR, 'These were not parsable json paths: ' + JSON.stringify(invalidPaths));
    }
    return true;
  }
}
