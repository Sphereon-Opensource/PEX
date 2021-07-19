import { Checked } from '../ConstraintUtils';

export class EvaluationResultHolder {

  vcMap: Map<any, Checked>;

  public initializeVCMap(vp: any): Map<any, Checked> {
    this.vcMap = new Map();
    if (vp.verifiableCredential) {
      for (let i = 0; i < vp.verifiableCredential.length; i++) {
        this.vcMap.set(vp.verifiableCredential[i], null);
      }
    }
    return this.vcMap;
  }

  public getVcMap() {
    return this.vcMap;
  }
}