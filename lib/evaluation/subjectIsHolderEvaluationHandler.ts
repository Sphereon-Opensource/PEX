import { HolderSubject, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import jp from 'jsonpath';

import { Status } from '../ConstraintUtils';
import { VerifiableCredential, VerifiablePresentation } from '../verifiablePresentation';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

export class SubjectIsHolderEvaluationHandler extends AbstractEvaluationHandler {
  public getName(): string {
    return 'IsHolderEvaluation';
  }

  public handle(d: PresentationDefinition, p: VerifiablePresentation): void {
    this.iterateOverInputCandidates(d, p);
  }

  private iterateOverInputCandidates(pd: PresentationDefinition, vp: VerifiablePresentation): void {
    for (const vc of vp.getVerifiableCredentials().entries()) {
      this.iterateOverInputDescriptors(pd, vc);
    }
  }

  private iterateOverInputDescriptors(pd: PresentationDefinition, vc: [number, VerifiableCredential]): void {
    const inputDescriptors: InputDescriptor[] = pd.input_descriptors;
    const result = jp.query(vc[1], `$..credentialSubject.id`)[0];
    inputDescriptors.forEach((inDesc, index) => {
      if (inDesc.constraints && inDesc.constraints.is_holder) {
        const did = this.client.did;
        inDesc.constraints.is_holder.forEach((ih) => {
          const resultObject = this.checkIsHolder(index, vc, result, did);
          this.checkDirectives(ih, resultObject);
        });
      }
    });
  }

  private checkDirectives(hs: HolderSubject, resultObject: HandlerCheckResult): void {
    if (hs.directive === 'preferred') {
      delete resultObject.payload['holder'];
      delete resultObject.payload['subject'];
    } else if (hs.directive === 'required') {
      delete resultObject.payload['is_holder'];
    }
    this.client.results.push(resultObject);
  }

  private checkIsHolder(
    index: number,
    vc: [number, VerifiableCredential],
    result: any,
    did: string
  ): HandlerCheckResult {
    const resultObject = this.createResultObject(index, vc[0]);
    resultObject.payload = { holder: did, subject: result, is_holder: true };
    if (result !== did) {
      resultObject.status = Status.ERROR;
      resultObject.message = 'The entity submitting the response is not the holder of the claim';
      resultObject.payload.is_holder = false;
    }
    return resultObject;
  }

  private createResultObject(idIndex: number, vcIndex: number): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIndex}]`,
      verifiable_credential_path: `$.verifiableCredential[${vcIndex}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: 'The entity submitting the response is the holder of the claim',
    };
  }
}
