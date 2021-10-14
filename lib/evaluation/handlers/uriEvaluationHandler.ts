import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../../ConstraintUtils';
import { VerifiablePresentation } from '../../verifiablePresentation';
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

  public handle(d: PresentationDefinition, p: VerifiablePresentation): void {
    for (let i = 0; i < d.input_descriptors.length; i++) {
      const inputDescriptor: InputDescriptor = d.input_descriptors[i];
      const uris: string[] = inputDescriptor.schema.map((so) => so.uri);
      for (let j = 0; j < p.verifiableCredential.length; j++) {
        const vc = p.verifiableCredential[j];
        this.evaluateUris(UriEvaluationHandler.getPresentationURI(vc), uris, i, j);
      }
    }
  }

  private static getPresentationURI(vc): string[] {
    const schemaUris: string[] = [];
    if (vc && vc['@context']) {
      schemaUris.push(...this.fetchContextUris(vc));
    } else if (vc && vc.vc['@context']) {
      schemaUris.push(...this.fetchContextUris(vc.vc));
    }
    return schemaUris;
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
      verifiable_credential_path: `$.verifiableCredential[${vcIdx}]`,
      evaluator: this.getName(),
      status: undefined,
      message: undefined,
    };
  }

  private static fetchContextUris(vc) {
    const schemaUris: string[] = [];
    if (vc && vc['@context']) {
      if (vc['@context'].length && typeof vc['@context'] != 'string') {
        for (let i = 0; i < vc['@context'].length; i++) {
          schemaUris.push(vc['@context'][i]);
        }
      } else {
        schemaUris.push(vc['@context']);
      }
    }
    return schemaUris;
  }
}
