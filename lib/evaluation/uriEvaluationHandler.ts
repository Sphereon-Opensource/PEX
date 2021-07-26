import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

export class UriEvaluationHandler extends AbstractEvaluationHandler {
  public getName(): string {
    return 'UriEvaluation';
  }

  public handle(d: PresentationDefinition, p: any, results: HandlerCheckResult[]): void {
    for (let i = 0; i < d.input_descriptors.length; i++) {
      const inputDescriptor: InputDescriptor = d.input_descriptors[i];
      const uris: string[] = inputDescriptor.schema.map((so) => so.uri);
      for (let j = 0; j < p.verifiableCredential.length; j++) {
        const vc = p.verifiableCredential[j];
        const input_descriptor_path = '$.input_descriptors[' + i + ']';
        const verifiable_credential_path = '$.verifiableCredential[' + j + ']';
        if (UriEvaluationHandler.stringsArePresentInList(UriEvaluationHandler.getPresentationURI(vc), uris)) {
          results.push(this.createInfoResultObject(input_descriptor_path, verifiable_credential_path));
        } else {
          results.push(this.createErrorResultObject(input_descriptor_path, verifiable_credential_path));
        }
      }
    }
  }

  private static getPresentationURI(vc) {
    const presentationURIs: string[] = [];
    if (vc.vc) {
      presentationURIs.push(vc.vc['credentialSchema']);
    } else if (vc['credentialSchema'] && vc['credentialSchema']) {
      for (let i = 0; i < vc['credentialSchema'].length; i++) {
        presentationURIs.push(vc['credentialSchema'][i].id);
      }
    }
    return presentationURIs;
  }

  //TODO: move it to a utility class
  private static stringsArePresentInList(presentationDefinitionUris: string[], inputDescriptorsUri: string[]): boolean {
    for (let i = 0; i < presentationDefinitionUris.length; i++) {
      if (inputDescriptorsUri.find((el) => el === presentationDefinitionUris[i]) == undefined) {
        return false;
      }
    }
    return true;
  }

  private createInfoResultObject(input_descriptor_path: string, verifiable_credential_path: string) {
    const result = this.createResult(input_descriptor_path, verifiable_credential_path);
    result.status = Status.INFO;
    result.message =
      'presentation_definition URI for the schema of the candidate input is equal to one of the input_descriptors object uri values.';
    return result;
  }

  private createErrorResultObject(input_descriptor_path: string, verifiable_credential_path: string) {
    const result = this.createResult(input_descriptor_path, verifiable_credential_path);
    result.status = Status.ERROR;
    result.message =
      'presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.';
    return result;
  }

  private createResult(input_descriptor_path: string, verifiable_credential_path: string) {
    return {
      input_descriptor_path,
      verifiable_credential_path,
      evaluator: this.getName(),
      status: undefined,
      message: undefined,
    };
  }
}
