import { Constraints, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import jp from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { JsonPathUtils } from '../../utils/jsonPathUtils';
import { VerifiableCredential } from '../../verifiablePresentation';
import { EvaluationClient } from '../evaluationClient';
import { HandlerCheckResult } from '../handlerCheckResult';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class SubjectIsIssuerEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'SubjectIsIssuerEvaluation';
  }

  public handle(pd: PresentationDefinition, vcs: VerifiableCredential[]): void {
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      const constraints: Constraints | undefined = pd.input_descriptors[i].constraints;
      if (constraints?.subject_is_issuer === Optionality.Required) {
        this.checkSubjectIsIssuer(pd.input_descriptors[i].id, vcs, i);
      }
    }
    if (this.getResults().filter((r) => r.evaluator === 'SubjectIsIssuerEvaluation').length) {
      this.presentationSubmission.descriptor_map = this.getResults()
        .filter((r) => r.status !== Status.ERROR && r.evaluator === 'SubjectIsIssuerEvaluation')
        .flatMap((r) => {
          /**
           * TODO map the nested credential
           */
          const inputDescriptor: InputDescriptor = jp.query(pd, r.input_descriptor_path)[0];
          return this.presentationSubmission.descriptor_map.filter(
            (ps) => ps.path === r.verifiable_credential_path && ps.id === inputDescriptor.id
          );
        });
    }
  }

  private checkSubjectIsIssuer(inputDescriptorId: string, vcs: VerifiableCredential[], idIdx: number) {
    if (this.client.presentationSubmission?.descriptor_map.length) {
      for (let i = 0; i < this.client.presentationSubmission.descriptor_map.length; i++) {
        const currentDescriptor = this.client.presentationSubmission?.descriptor_map[i];
        if (currentDescriptor?.id === inputDescriptorId) {
          const vc = JsonPathUtils.extractInputField(vcs, [currentDescriptor.path]);
          if (vc.length > 0 && vc[0].value.issuer === vc[0].value.credentialSubject.id) {
            this.generateSuccessResult(idIdx, vcs, vc[0].value.id);
          } else {
            this.generateErrorResult(idIdx, vcs, vc[0].value.id);
          }
        }
      }
    }
  }

  private generateErrorResult(idIdx: number, vcs: VerifiableCredential[], vcId: string) {
    const result = this.generateResult(idIdx, vcs, vcId);
    if (result == null) {
      this.getResults().push(this.generateVcNotFoundError(idIdx, vcs));
    } else {
      result.status = Status.ERROR;
      result.message = "couldn't verify subject is issuer.";
      this.getResults().push(result);
    }
  }

  private generateSuccessResult(idIdx: number, vcs: VerifiableCredential[], vcId: string) {
    const result = this.generateResult(idIdx, vcs, vcId);
    if (result == null) {
      this.getResults().push(this.generateVcNotFoundError(idIdx, vcs));
    } else {
      result.status = Status.INFO;
      result.message = 'subject_is_issuer verified.';
      this.getResults().push(result);
    }
  }

  private generateResult(idIdx: number, vcs: VerifiableCredential[], vcId: string): HandlerCheckResult | undefined {
    for (let i = 0; i < vcs.length; i++) {
      if (vcs[i]['id'] === vcId) {
        return new HandlerCheckResult(
          `$.input_descriptors[${idIdx}]`,
          `$.verifiableCredential[${i}]`,
          this.getName(),
          Status.INFO,
          undefined,
          undefined
        );
      }
    }
    return undefined;
  }

  private generateVcNotFoundError(idIdx: number, vcs: VerifiableCredential[]): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: '',
      evaluator: this.getName(),
      status: Status.ERROR,
      message: "couldn't find the verifiableCredential corresponding to VC in final verifiablePresentation.",
      payload: vcs,
    };
  }
}
