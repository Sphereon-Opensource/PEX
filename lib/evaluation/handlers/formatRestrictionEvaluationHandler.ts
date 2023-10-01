import { WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition, InternalPresentationDefinitionV1, InternalPresentationDefinitionV2 } from '../../types';
import PexMessages from '../../types/Messages';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class FormatRestrictionEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'FormatRestrictionEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    const restrictToFormats = this.client.restrictToFormats ? Object.keys(this.client.restrictToFormats) : undefined;

    (pd as InternalPresentationDefinitionV1 | InternalPresentationDefinitionV2).input_descriptors.forEach((_inputDescriptor, index) => {
      wrappedVcs.forEach((wvc: WrappedVerifiableCredential, vcIndex: number) => {
        const formats = 'format' in _inputDescriptor && _inputDescriptor.format ? Object.keys(_inputDescriptor.format) : [wvc.format];
        let allowedFormats = restrictToFormats ?? formats;
        if ('format' in _inputDescriptor && _inputDescriptor.format && restrictToFormats !== undefined) {
          // Take the instersection, as an argument has been supplied for restrictions
          allowedFormats = Object.keys(_inputDescriptor.format).filter((k) => restrictToFormats.includes(k));
        }
        if (allowedFormats.includes(wvc.format)) {
          this.getResults().push(
            this.generateSuccessResult(index, `$[${vcIndex}]`, wvc, `${wvc.format} is allowed from ${JSON.stringify(allowedFormats)}`),
          );
        } else {
          this.getResults().push(this.generateErrorResult(index, `$[${vcIndex}]`, wvc));
        }
      });
    });

    this.updatePresentationSubmission(pd);
  }

  private generateErrorResult(idIdx: number, vcPath: string, wvc: WrappedVerifiableCredential): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: PexMessages.FORMAT_RESTRICTION_DIDNT_PASS,
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
      message: message ?? PexMessages.FORMAT_RESTRICTION_PASSED,
      verifiable_credential_path: vcPath,
      payload: {
        format: wvc.format,
      },
    };
  }
}
