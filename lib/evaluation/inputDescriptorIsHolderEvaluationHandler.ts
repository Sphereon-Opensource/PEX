import { HolderSubject, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

export class InputDescriptorIsHolderEvaluationHandler extends AbstractEvaluationHandler {

  public getName(): string {
    return 'IsHolderEvaluation';
  }

  public handle(d: PresentationDefinition, p: unknown): void {
    this.iterateOverInputCandidates(d, p);
  }

  private iterateOverInputCandidates(pd: PresentationDefinition, inputCandidates: unknown): void {
    const verifiableCredentials = this.extractVerifiableCredentials(inputCandidates);
    for (const [key, value] of verifiableCredentials) {
      for (const vc of value.entries()) {
        this.iterateOverInputDescriptors(pd, vc, key);
      }
    }
  }

  private extractVerifiableCredentials(inputCandidates: unknown): Array<[string, Array<unknown>]> {
    return Object.entries(inputCandidates).filter(
      (x) => Array.isArray(x[1]) && x[1].length && typeof x[1][0] === 'object'
    ) as Array<[string, Array<unknown>]>;
  }

  private iterateOverInputDescriptors(pd: PresentationDefinition, vc: [number, unknown], path: string): void {
    const inputDescriptors: InputDescriptor[] = pd.input_descriptors;
    const results = this.removeDuplicates(this.getResults(), 'input_descriptor_path', 'verifiable_credential_path', 'status');
    
    inputDescriptors.forEach((id, index) => {
      results.forEach( result => {
        if (result.input_descriptor_path === `$.input_descriptors[${index}]` && result.verifiable_credential_path === `$.${path}[${vc[0]}]`) {
          if (id.constraints && id.constraints.is_holder && id.constraints.fields) {
            const matched: Array<HolderSubject> = [];
            const not_matched: Array<HolderSubject> = [];
            let ids = id.constraints.fields.map(x => x.id);
            id.constraints.is_holder.forEach(ih => {
              const field_id = ih.field_id.find(i => ids.includes(i));
              if (field_id) {
                matched.push({...ih});
              } else {
                not_matched.push({...ih});
              }
            });
            if (not_matched.length) {
              const payload = { matched, not_matched };
              const resultObj = this.createResultObject(path, index, vc[0]);
              resultObj.payload = payload;
              resultObj.status = Status.ERROR;
              resultObj.message = 'Input candidate invalid for presentation submission';
              this.getResults().push(resultObj);
            } else {
              const payload = { matched, not_matched };
              const resultObj = this.createResultObject(path, index, vc[0]);
              resultObj.payload = payload;
              this.getResults().push(resultObj);
            }
          }
        }
      });
    });
  }

  private removeDuplicates(arr: any, id_path: string, vc_path: string, status: string): Array<any> {
    return arr.filter((value: any, index: number, self:any )=> index === self.findIndex(el => el[id_path] === value[id_path] && el[vc_path] === value[vc_path] && el[status] === value[status]));
  }

  private createResultObject(path: string, idIndex: number, vcIndex: number): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIndex}]`,
      verifiable_credential_path: `$.${path}[${vcIndex}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: 'Input candidate valid for presentation submission',
    };
  }
}
