import { PresentationDefinition } from 'pe-models';

import { Validation } from '../core';

import { InputDescriptorVB } from './inputDescriptorVB';
import { ValidationBundler } from './validationBundler';

export class PresentationDefinitionVB extends ValidationBundler<PresentationDefinition> {
  constructor(parentTag: string) {
    super(parentTag, 'pd');
  }

  public getValidations(pd: PresentationDefinition): Validation<unknown>[] {
    return this.myValidations(pd).concat(
      new InputDescriptorVB(this.myTag).getValidations(pd.input_descriptors)
    );
  }

  private myValidations(pd: PresentationDefinition): Validation<unknown>[] {
    return [
      [
        this.getTag(),
        pd,
        this.shouldBeNonEmptyArray(),
        'inputDescriptors should be a non-empty array',
      ],
    ];
  }

  private shouldBeNonEmptyArray() {
    // TODO extract to generic utils or use something like lodash
    return (pd: PresentationDefinition): boolean =>
      pd.input_descriptors != null && pd.input_descriptors.length > 0;
  }
}
