import { PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class UriEvaluationHandler extends AbstractEvaluationHandler {

  failed_checked: Checked  = {
    tag: 'root.input_descriptors',
    status: Status.ERROR,
    message: 'presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.'
  };

  public handle(d: PresentationDefinition, p: any, result: Map<any, Checked>): void {
    const uriArrays: string[][] = d.input_descriptors.map((inDesc) => inDesc.schema.map((so) => so.uri));
    let uris = [];
    uris = uris.concat.apply([], uriArrays);

    for (let i = 0; i < p.verifiableCredential.length; i++) {
      const vc = p.verifiableCredential[i];
      if (!UriEvaluationHandler.stringIsPresentInList(UriEvaluationHandler.getPDUri(vc), uris)) {
        result.set(vc, this.failed_checked);
      }
    }
  }

  private static getPDUri(vc) {
    let presentationDefinitionUri = '';
    if (vc.vc) {
      presentationDefinitionUri = vc.vc['@context'];
    } else if (vc['@context']) {
      presentationDefinitionUri = vc['@context'];
    }
    return presentationDefinitionUri;
  }

  //TODO: move it to a utility class
  private static stringIsPresentInList(presentationDefinitionUri: string, input_descriptors_uri: string[]): boolean {
    return (
      presentationDefinitionUri != null &&
      presentationDefinitionUri != '' &&
      input_descriptors_uri.find((el) => el === presentationDefinitionUri) != undefined
    );
  }
}
