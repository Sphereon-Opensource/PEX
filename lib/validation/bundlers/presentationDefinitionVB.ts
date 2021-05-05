import { PresentationDefinition } from 'pe-models';

import { Validation } from '../core';

import { InputDescriptorVB } from './inputDescriptorVB';
import { ValidationBundler } from './validationBundler';

export class PresentationDefinitionVB extends ValidationBundler<PresentationDefinition> {
  constructor(parentTag: string) {
    super(parentTag, 'presentation_definition');
  }

  public getValidations(pd: PresentationDefinition): Validation<unknown>[] {
    return this.myValidations(pd).concat(
      new InputDescriptorVB(this.myTag).getValidations(pd.input_descriptors)
    );
  }

  private myValidations(pd: PresentationDefinition): Validation<unknown>[] {
    return [
      {
        tag: this.getTag(),
        target: pd,
        predicate: PresentationDefinitionVB.shouldBeNonEmptyArray,
        message: 'inputDescriptors should be a non-empty array',
      },
    ];
  }

  private static shouldBeNonEmptyArray(pd: PresentationDefinition): boolean {
    // TODO extract to generic utils or use something like lodash
    return pd.input_descriptors != null && pd.input_descriptors.length > 0;
  }
}
