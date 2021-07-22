import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked } from '../ConstraintUtils';

export class EvaluationResultHolder {
  inputDescriptorMap: Map<InputDescriptor, Map<unknown, Checked>>;

  //TODO: change any to VerifiablePresentationWrapper or something like this
  public initializeVCMap(pd: PresentationDefinition, vp: any): Map<InputDescriptor, Map<unknown, Checked>> {
    this.inputDescriptorMap = new Map();
    if (pd.input_descriptors && vp.verifiableCredential) {
      for (let i = 0; i < pd.input_descriptors.length; i++) {
        const vcMap = new Map();
        for (let j = 0; j < vp.verifiableCredential.length; j++) {
          vcMap.set(vp.verifiableCredential[j], null);
        }
        this.inputDescriptorMap.set(pd.input_descriptors[i], vcMap);
      }
    }
    return this.inputDescriptorMap;
  }

  public getVcMap() {
    return this.inputDescriptorMap;
  }
}
