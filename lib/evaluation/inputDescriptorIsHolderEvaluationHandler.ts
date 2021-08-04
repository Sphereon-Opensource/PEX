import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import jp from 'jsonpath';

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

  private iterateOverInputCandidates(pd: PresentationDefinition, inputCandidates: any): void {
    const props = Object.entries(inputCandidates).filter(
      (x) => Array.isArray(x[1]) && x[1].length && typeof x[1][0] === 'object'
    ) as Array<[string, Array<unknown>]>;
    for (const [key, value] of props) {
      for (const vc of value.entries()) {
        this.iterateOverInputDescriptors(pd, vc, key);
      }
    }
  }

  private iterateOverInputDescriptors(pd: PresentationDefinition, vc: [number, unknown], path: string): void {
    const inputDescriptors: InputDescriptor[] = pd.input_descriptors;
    const result = jp.query(vc[1], `$..credentialSubject..id`);
    result.shift();
    inputDescriptors.forEach((id, index) => {
      if (id.constraints && id.constraints.is_holder) {
        id.constraints.is_holder.forEach((ih) => {
          const sameHolder = this.arrayEquals(ih.field_id, result);
          const resultObject = this.createResultObject(path, index, vc[0]);
          if (!sameHolder) {
            resultObject.status = Status.ERROR;
            resultObject.message = 'Input candidate invalid for presentation submission';
          }
          if (ih.directive === 'preferred') {
            const payload = { sameHolder };
            resultObject.payload = payload;
            this.client.results.push(resultObject);
          } else if (ih.directive === 'required') {
            const payload = { sameHolder: { expected: ih.field_id, actual: result } };
            resultObject.payload = payload;
            resultObject.status = Status.WARN;
            this.client.results.push(resultObject);
          }
        });
      }
    });
  }

  //TODO move to utils
  private arrayEquals(a: Array<unknown>, b: Array<unknown>): boolean {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
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
