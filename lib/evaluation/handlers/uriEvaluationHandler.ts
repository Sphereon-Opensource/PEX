import { Descriptor, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import jp from 'jsonpath';
import { nanoid } from 'nanoid';

import { Status } from '../../ConstraintUtils';
import { VerifiableCredential } from '../../types';
import { EvaluationClient } from '../evaluationClient';
import { HandlerCheckResult } from '../handlerCheckResult';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class UriEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'UriEvaluation';
  }

  public handle(d: PresentationDefinition, vcs: VerifiableCredential[]): void {
    d.input_descriptors.forEach((inDesc: InputDescriptor, i: number) => {
      const uris: string[] = inDesc.schema.map((so) => so.uri);
      vcs.forEach((vc: VerifiableCredential, j: number) => {
        this.evaluateUris(vc.getContext(), uris, i, j);
      });
    });
    const descriptorMap: Descriptor[] = this.getResults()
      .filter((e) => e.status === Status.INFO)
      .map((e) => {
        const inputDescriptor: InputDescriptor = jp.nodes(d, e.input_descriptor_path)[0].value;
        return {
          id: inputDescriptor.id,
          format: 'ldp_vc',
          path: e.verifiable_credential_path,
        };
      });
    this.presentationSubmission = {
      id: nanoid(),
      definition_id: d.id,
      descriptor_map: descriptorMap,
    };
  }

  private evaluateUris(
    verifiableCredentialUris: string[],
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number
  ): void {
    let hasAnyMatch = false;
    for (let i = 0; i < verifiableCredentialUris.length; i++) {
      if (inputDescriptorsUris.find((el) => el === verifiableCredentialUris[i]) != undefined) {
        hasAnyMatch = true;
      }
    }
    if (hasAnyMatch) {
      this.getResults().push(
        this.createSuccessResultObject(verifiableCredentialUris, inputDescriptorsUris, idIdx, vcIdx)
      );
    } else {
      this.getResults().push(
        this.createErrorResultObject(verifiableCredentialUris, inputDescriptorsUris, idIdx, vcIdx)
      );
    }
  }

  private createSuccessResultObject(
    verifiableCredentialUris: string[],
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number
  ) {
    const result: HandlerCheckResult = this.createResult(idIdx, vcIdx);
    result.status = Status.INFO;
    result.message =
      '@context URI(s) for the schema of the candidate input is equal to one of the input_descriptors object uri values.';
    result.payload = { presentationDefinitionUris: verifiableCredentialUris, inputDescriptorsUris };
    return result;
  }

  private createErrorResultObject(
    verifiableCredentialUris: string[],
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number
  ) {
    const result = this.createResult(idIdx, vcIdx);
    result.status = Status.ERROR;
    result.message =
      '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.';
    result.payload = { presentationDefinitionUris: verifiableCredentialUris, inputDescriptorsUris };
    return result;
  }

  private createResult(idIdx: number, vcIdx: number): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: undefined,
    };
  }
}
