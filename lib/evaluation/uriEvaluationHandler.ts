import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class UriEvaluationHandler extends AbstractEvaluationHandler {
  failed_checked: Checked = {
    tag: 'root.input_descriptor',
    status: Status.ERROR,
    message:
      'presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
  };

  public handle(d: PresentationDefinition, p: any, result: Map<InputDescriptor, Map<any, Checked>>): void {
    for (let i = 0; i < d.input_descriptors.length; i++) {
      const inputDescriptor: InputDescriptor = d.input_descriptors[i];
      const uris: string[] = inputDescriptor.schema.map((so) => so.uri);
      for (let j = 0; j < p.verifiableCredential.length; j++) {
        const vc = p.verifiableCredential[j];
        if (result.get(inputDescriptor).get(vc) && result.get(inputDescriptor).get(vc).status === Status.ERROR) {
          continue;
        }
        if (!UriEvaluationHandler.stringsArePresentInList(UriEvaluationHandler.getPDUri(vc), uris)) {
          result.get(inputDescriptor).set(vc, this.failed_checked);
        }
      }
    }
    super.handle(d, p, result);
  }

  private static getPDUri(vc) {
    const presentationDefinitionUris: string[] = [];
    if (vc.vc) {
      presentationDefinitionUris.push(vc.vc['credentialSchema']);
    } else if (vc['credentialSchema'] && vc['credentialSchema']) {
      for (let i = 0; i < vc['credentialSchema'].length; i++) {
        presentationDefinitionUris.push(vc['credentialSchema'][i].id);
      }
    }
    return presentationDefinitionUris;
  }

  //TODO: move it to a utility class
  private static stringsArePresentInList(
    presentationDefinitionUris: string[],
    input_descriptors_uri: string[]
  ): boolean {
    for (let i = 0; i < presentationDefinitionUris.length; i++) {
      //input_descriptors_uri.find((el) => el === presentationDefinitionUri) != undefined
      if (input_descriptors_uri.find((el) => el === presentationDefinitionUris[i]) == undefined) {
        return false;
      }
    }
    return true;
  }
}
