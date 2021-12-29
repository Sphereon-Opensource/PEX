import { ConstraintsV1, ConstraintsV2, Optionality } from '@sphereon/pex-models';
import { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { InternalVerifiableCredential } from '../../types';
import PEMessages from '../../types/Messages';
import { InternalPresentationDefinition, InternalPresentationDefinitionV2 } from '../../types/SSI.types';
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

  public handle(pd: InternalPresentationDefinition, vcs: InternalVerifiableCredential[]): void {
    // PresentationDefinitionV2 is the common denominator
    (pd as InternalPresentationDefinitionV2).input_descriptors.forEach((inputDescriptor, index) => {
      const constraints: ConstraintsV1 | ConstraintsV2 | undefined = inputDescriptor.constraints;
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

  private checkSubjectIsIssuer(inputDescriptorId: string, vcs: InternalVerifiableCredential[], idIdx: number): void {
    this.client.presentationSubmission.descriptor_map.forEach((currentDescriptor) => {
      if (currentDescriptor.id === inputDescriptorId) {
        const vc: { path: PathComponent[]; value: InternalVerifiableCredential }[] = JsonPathUtils.extractInputField(
          vcs,
          [currentDescriptor.path]
        );
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
      message: PEMessages.SUBJECT_IS_NOT_ISSUER,
      verifiable_credential_path: vcPath,
    };
  }

  private generateSuccessResult(idIdx: number, vcPath: string, message?: string): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: message ?? PEMessages.SUBJECT_IS_ISSUER,
      verifiable_credential_path: vcPath,
    };
  }
}
