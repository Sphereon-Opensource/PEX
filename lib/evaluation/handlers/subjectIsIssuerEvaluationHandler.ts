import { Constraints, Optionality } from '@sphereon/pe-models';
import { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { VerifiableCredential } from '../../types';
import { PresentationDefinition, PresentationDefinitionV2 } from '../../types/SSI.types';
import { JsonPathUtils } from '../../utils';
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
    // PresentationDefinitionV2 is the common denominator
    (pd as PresentationDefinitionV2).input_descriptors.forEach((inputDescriptor, index) => {
      const constraints: Constraints | undefined = inputDescriptor.constraints;
      if (constraints?.subject_is_issuer === Optionality.Required) {
        this.checkSubjectIsIssuer(inputDescriptor.id, vcs, index);
      } else {
        this.getResults().push(
          ...vcs.map((_, vcIndex) => this.generateSuccessResult(index, `$[${vcIndex}]`, 'not applicable'))
        );
      }
    });
    this.updatePresentationSubmission(pd);
  }

  private checkSubjectIsIssuer(inputDescriptorId: string, vcs: VerifiableCredential[], idIdx: number): void {
    this.client.presentationSubmission.descriptor_map.forEach((currentDescriptor) => {
      if (currentDescriptor.id === inputDescriptorId) {
        const vc: { path: PathComponent[]; value: VerifiableCredential }[] = JsonPathUtils.extractInputField(vcs, [
          currentDescriptor.path,
        ]);
        if (vc[0]?.value.issuer === vc[0]?.value.getBaseCredential().credentialSubject.id) {
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

  private generateSuccessResult(idIdx: number, vcPath: string, message?: string): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: message ?? 'subject is issuer',
      verifiable_credential_path: vcPath,
    };
  }
}
