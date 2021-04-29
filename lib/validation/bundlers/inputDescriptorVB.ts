import { InputDescriptors } from 'pe-models';

import { Validation } from '../core';

import { ValidationBundler } from './validationBundler';

export class InputDescriptorVB extends ValidationBundler<InputDescriptors> {
  constructor(parentTag: string) {
    super(parentTag, 'input_descriptor');
  }

  public getValidations(inDesc: InputDescriptors[]): Validation<unknown>[] {
    return [
      {
        tag: this.getTag(),
        target: inDesc[0],
        predicate: this.nonEmptyString(),
        message: 'must contain non-null name',
      }, // TODO check if it is to be done as per Spec
    ];
  }

  private nonEmptyString() {
    // TODO extract to generic utils or use something like lodash
    return (inDesc: InputDescriptors): boolean => inDesc.name != null;
  }
}
