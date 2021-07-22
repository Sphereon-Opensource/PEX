import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked } from '../ConstraintUtils';

import { SubmissionMarked } from './submissionMarked';

export class EvaluationResultHolder {
  inputDescriptorMap: Map<InputDescriptor, Map<any, Checked>>;

  public initializeVCMap(pd: PresentationDefinition, vp: any): Map<InputDescriptor, Map<any, Checked>> {
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

  public markForPresentationSubmission(): Array<SubmissionMarked> {
    const presentationSubmissionMarked: Array<SubmissionMarked> = []
    this.inputDescriptorMap.forEach((vcMap, inputDescriptor) => {
      vcMap.forEach((checked, vc) => {
        if (!checked) {
          presentationSubmissionMarked.push({
            inputDescriptor: inputDescriptor,
            group: inputDescriptor.group,
            inputCandidate: vc
          })
        }
      });
    });
    return presentationSubmissionMarked;
  }
}
