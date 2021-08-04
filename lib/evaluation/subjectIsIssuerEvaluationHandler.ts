import { Constraints, Descriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';
import { JsonPathUtils } from '../utils/jsonPathUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { EvaluationClient } from './evaluationClient';
import { HandlerCheckResult } from './handlerCheckResult';

export class SubjectIsIssuerEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'SubjectIsIssuerEvaluation';
  }

  public handle(pd: PresentationDefinition, p: unknown): void {
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      const constraints: Constraints = pd.input_descriptors[i].constraints;
      if (constraints && constraints.subject_is_issuer && constraints.subject_is_issuer === Optionality.Required) {
        this.checkSubjectIsIssuer(pd.input_descriptors[i].id, p, i);
      }
    }
  }

  private checkSubjectIsIssuer(inputDescriptorId: string, vp: unknown, idIdx: number) {
    const verifiablePresentation = this.verifiablePresentation;
    for (let i = 0; i < verifiablePresentation.presentationSubmission.descriptor_map.length; i++) {
      const currentDescriptor: Descriptor = this.verifiablePresentation.presentationSubmission.descriptor_map[i];
      if (currentDescriptor.id === inputDescriptorId) {
        const vc = JsonPathUtils.extractInputField(this.verifiablePresentation, [currentDescriptor.path]);
        if (vc[0].value.issuer === vc[0].value.credentialSubject.id) {
          this.generateSuccessResult(idIdx, vp, vc[0].value.id);
        } else {
          this.generateErrorResult(idIdx, vp, vc[0].value.id);
        }
      }
    }
  }

  private generateErrorResult(idIdx: number, vp: unknown, vcId: string) {
    const result = this.generateResult(idIdx, vp, vcId);
    if (result == null) {
      this.results.push(this.generateVcNotFoundError(idIdx, vp));
    } else {
      result.status = Status.ERROR;
      result.message = "couldn't verify subject is issuer.";
      this.results.push(result);
    }
  }

  private generateSuccessResult(idIdx: number, vp: unknown, vcId: string) {
    const result = this.generateResult(idIdx, vp, vcId);
    if (result == null) {
      this.results.push(this.generateVcNotFoundError(idIdx, vp));
    } else {
      result.status = Status.INFO;
      result.message = 'subject_is_issuer verified.';
      this.results.push(result);
    }
  }

  private generateResult(idIdx: number, vp: any, vcId: string): HandlerCheckResult {
    for (let i = 0; i < vp.verifiableCredential.length; i++) {
      if (vp.verifiableCredential[i].id === vcId) {
        return new HandlerCheckResult(
          `$.input_descriptors[${idIdx}]`,
          `$.verifiableCredential[${i}]`,
          this.getName(),
          undefined,
          undefined,
          undefined
        );
      }
    }
    return null;
  }

  private generateVcNotFoundError(idIdx: number, vp: unknown) {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: undefined,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: "couldn't find the verifiableCredential corresponding to VC in final verifiablePresentation.",
      payload: vp,
    };
  }
}
