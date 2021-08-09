import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { EvaluationClient } from './evaluationClient';
import { HandlerCheckResult } from './handlerCheckResult';

export class UriEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'UriEvaluation';
  }

  public handle(d: PresentationDefinition, p: any): void {
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
    if (vc.credentialSchema) {
      for (let i = 0; i < vc.credentialSchema.length; i++) {
        schemaUris.push(vc.credentialSchema[i].id);
      }
    } else if (vc.vc && vc.vc.id) {
      schemaUris.push(vc.vc.id);
    } else if (vc.id) {
      schemaUris.push(vc.id);
    }
    return schemaUris;
  }

  private evaluateUris(
    presentationDefinitionUris: string[],
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number
  ): void {
    let hasError = false;
    for (let i = 0; i < presentationDefinitionUris.length; i++) {
      if (inputDescriptorsUris.find((el) => el === presentationDefinitionUris[i]) == undefined) {
        this.getResults().push(
          this.createErrorResultObject(presentationDefinitionUris[i], inputDescriptorsUris, idIdx, vcIdx)
        );
        hasError = true;
      }
    }
    if (!hasError) {
      this.getResults().push(
        this.createSuccessResultObject(presentationDefinitionUris, inputDescriptorsUris, idIdx, vcIdx)
      );
    }
  }

  private createSuccessResultObject(
    presentationDefinitionUris: string[],
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number
  ) {
    const result: HandlerCheckResult = this.createResult(idIdx, vcIdx);
    result.status = Status.INFO;
    result.message =
      'presentation_definition URI for the schema of the candidate input is equal to one of the input_descriptors object uri values.';
    result.payload = { presentationDefinitionUris, inputDescriptorsUris };
    return result;
  }

  private createErrorResultObject(
    presentationDefinitionUri: string,
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number
  ) {
    const result = this.createResult(idIdx, vcIdx);
    result.status = Status.ERROR;
    result.message =
      'presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.';
    result.payload = { presentationDefinitionUri, inputDescriptorsUris };
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
}
