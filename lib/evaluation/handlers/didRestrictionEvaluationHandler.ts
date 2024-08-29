import { CredentialMapper, WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Status } from '../../ConstraintUtils';
import {
  IInternalPresentationDefinition,
  InternalPresentationDefinitionV1,
  InternalPresentationDefinitionV2
} from '../../types';
import PexMessages from '../../types/Messages';
import { isRestrictedDID } from '../../utils';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class DIDRestrictionEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'DIDRestrictionEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    (pd as InternalPresentationDefinitionV1 | InternalPresentationDefinitionV2).input_descriptors.forEach((_inputDescriptor, index) => {
      wrappedVcs.forEach((wvc: WrappedVerifiableCredential, vcIndex: number) => {
        const issuerId = this.getIssuerIdFromWrappedVerifiableCredential(wvc);
        if (
          !this.client.hasRestrictToDIDMethods() ||
          !issuerId ||
          isRestrictedDID(issuerId, this.client.restrictToDIDMethods) ||
          !issuerId.toLowerCase().startsWith('did:')
        ) {
          this.getResults().push(this.generateSuccessResult(index, `$[${vcIndex}]`, wvc, `${issuerId} is allowed`));
        } else {
          this.getResults().push(this.generateErrorResult(index, `$[${vcIndex}]`, wvc));
        }
      });
    });

    this.updatePresentationSubmission(pd);
  }

  private getIssuerIdFromWrappedVerifiableCredential(wrappedVc: WrappedVerifiableCredential) {
    if (CredentialMapper.isW3cCredential(wrappedVc.credential)) {
      return typeof wrappedVc.credential.issuer === 'object' ? wrappedVc.credential.issuer.id : wrappedVc.credential.issuer;
    } else if (CredentialMapper.isSdJwtDecodedCredential(wrappedVc.credential)) {
      return wrappedVc.credential.decodedPayload.iss;
    } else if (CredentialMapper.isMsoMdocOid4VPEncoded(wrappedVc.credential) && typeof (wrappedVc.decoded) === 'object') {
      return wrappedVc.decoded.iss ?? '';
    }
    return ''; // FIXME Funke
    // throw new Error('Unsupported credential type');
  }

  private generateErrorResult(idIdx: number, vcPath: string, wvc: WrappedVerifiableCredential): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: PexMessages.FORMAT_RESTRICTION_DIDNT_PASS,
      verifiable_credential_path: vcPath,
      payload: {
        format: wvc.format
      }
    };
  }

  private generateSuccessResult(idIdx: number, vcPath: string, wvc: WrappedVerifiableCredential, message?: string): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: message ?? PexMessages.FORMAT_RESTRICTION_PASSED,
      verifiable_credential_path: vcPath,
      payload: {
        format: wvc.format
      }
    };
  }
}
