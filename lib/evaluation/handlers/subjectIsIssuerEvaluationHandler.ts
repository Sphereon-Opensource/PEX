import { ConstraintsV1, ConstraintsV2, Optionality } from '@sphereon/pex-models';
import { CredentialMapper, IVerifiableCredential, WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition, InternalPresentationDefinitionV2, PathComponent } from '../../types';
import PexMessages from '../../types/Messages';
import { getIssuerString, getSubjectIdsAsString, JsonPathUtils } from '../../utils';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class SubjectIsIssuerEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'SubjectIsIssuerEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    // PresentationDefinitionV2 is the common denominator
    (pd as InternalPresentationDefinitionV2).input_descriptors.forEach((inputDescriptor, index) => {
      const constraints: ConstraintsV1 | ConstraintsV2 | undefined = inputDescriptor.constraints;
      if (constraints?.subject_is_issuer === Optionality.Required) {
        // @todo: Huh, this should also be checked when preferred, but without any errors
        this.checkSubjectIsIssuer(inputDescriptor.id, wrappedVcs, index);
      } else {
        // Why is this here?
        this.getResults().push(...wrappedVcs.map((wvc, vcIndex) => this.generateSuccessResult(index, `$[${vcIndex}]`, wvc, 'not applicable')));
      }
    });
    this.updatePresentationSubmission(pd);
  }

  private checkSubjectIsIssuer(inputDescriptorId: string, wrappedVcs: WrappedVerifiableCredential[], idIdx: number): void {
    this.client.presentationSubmission.descriptor_map.forEach((currentDescriptor) => {
      if (currentDescriptor.id === inputDescriptorId) {
        const mappings: { path: PathComponent[]; value: IVerifiableCredential }[] = JsonPathUtils.extractInputField(
          wrappedVcs.map((wvc) => wvc.credential),
          [currentDescriptor.path],
        ) as { path: PathComponent[]; value: IVerifiableCredential }[];
        for (const mapping of mappings) {
          const issuer = getIssuerString(mapping.value);
          if (mapping && mapping.value && getSubjectIdsAsString(mapping.value).every((item) => item === issuer)) {
            this.getResults().push(
              this.generateSuccessResult(idIdx, currentDescriptor.path, CredentialMapper.toWrappedVerifiableCredential(mapping.value)),
            );
          } else {
            this.getResults().push(
              this.generateErrorResult(idIdx, currentDescriptor.path, CredentialMapper.toWrappedVerifiableCredential(mapping.value)),
            );
          }
        }
      }
    });
  }

  private generateErrorResult(idIdx: number, vcPath: string, wvc: WrappedVerifiableCredential): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: PexMessages.SUBJECT_IS_NOT_ISSUER,
      verifiable_credential_path: vcPath,
      payload: {
        format: wvc.format,
      },
    };
  }

  private generateSuccessResult(idIdx: number, vcPath: string, wvc: WrappedVerifiableCredential, message?: string): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: message ?? PexMessages.SUBJECT_IS_ISSUER,
      verifiable_credential_path: vcPath,
      payload: {
        format: wvc.format,
      },
    };
  }
}
