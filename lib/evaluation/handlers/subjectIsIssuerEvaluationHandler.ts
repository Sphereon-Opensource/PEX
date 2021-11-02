import { Constraints, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import jp, { PathComponent } from 'jsonpath';

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
    pd.input_descriptors.forEach((inputDescriptor, index) => {
      const constraints: Constraints | undefined = inputDescriptor.constraints;
      if (constraints?.subject_is_issuer === Optionality.Required) {
        this.checkSubjectIsIssuer(inputDescriptor.id, vcs, index);
      }
    });
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

  private checkSubjectIsIssuer(inputDescriptorId: string, vcs: VerifiableCredential[], idIdx: number): void {
    this.client.presentationSubmission.descriptor_map.forEach((currentDescriptor) => {
      if (currentDescriptor.id === inputDescriptorId) {
        const vc: { path: PathComponent[]; value: VerifiableCredential }[] = JsonPathUtils.extractInputField(vcs, [
          currentDescriptor.path,
        ]);
        if (vc[0]?.value.issuer === vc[0]?.value.credentialSubject.id) {
          this.getResults().push(this.generateSuccessResult(idIdx, currentDescriptor.path));
        } else {
          this.getResults().push(this.generateErrorResult(idIdx, currentDescriptor.path));
        }
      }
    });
  }

  private generateErrorResult(idIdx: number, vcPath: string): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: 'subject is not issuer',
      verifiable_credential_path: vcPath,
    };
  }

  private generateSuccessResult(idIdx: number, vcPath: string): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: 'subject is issuer',
      verifiable_credential_path: vcPath,
    };
  }
}
