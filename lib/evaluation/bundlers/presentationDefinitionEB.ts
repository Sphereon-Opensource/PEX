import { PresentationDefinition } from '@sphereon/pe-models';

import { Evaluation } from '../core';

import { EvaluationBundler } from './evaluationBundler';

export class PresentationDefinitionEB extends EvaluationBundler<unknown, PresentationDefinition> {
  constructor(parentTag: string) {
    super(parentTag, 'presentation_definition');
  }

  public getEvaluations(d: any, p: PresentationDefinition): Evaluation<any, any>[] {
    return [...this.myEvaluations(d, p)];
  }

  private myEvaluations(d: any, p: PresentationDefinition): Evaluation<any, any>[] {
    return [
      // E Section 4.3.1   : The URI for the schema of the candidate input MUST match one of the Input Descriptor schema object uri values exactly.
      {
        tag: this.getTag(),
        target: { d, p },
        predicate: () => d != null && p != null,
        message: 'presentation_definition should be non null.',
      },
      {
        tag: this.getTag(),
        target: { d, p },
        predicate: PresentationDefinitionEB.evaluateUri,
        message:
          'presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
      },
    ];
  }

  private static evaluateUri(psw: any, pd: PresentationDefinition): boolean {
    const uriArrays: string[][] = pd.input_descriptors.map((id) => id.schema.map((so) => so.uri));
    const uris = [].concat.apply([], uriArrays);
    // @ts-ignore
    for (let i = 0; i < psw.verifiableCredential.length; i++) {
      // @ts-ignore
      const vc = psw.verifiableCredential[i];
      if (vc.vc) {
        if (!PresentationDefinitionEB.stringIsPresentInList(vc.vc['@context'], uris)) {
          return false;
        }
      } else if (vc['@context']) {
        if (!PresentationDefinitionEB.stringIsPresentInList(vc['@context'], uris)) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  private static stringIsPresentInList(presentation_definition_uri: string, input_descriptors_uri: string[]): boolean {
    // TODO extract to generic utils or use something like lodash
    return (
      presentation_definition_uri != null &&
      input_descriptors_uri.find((el) => el === presentation_definition_uri) != undefined
    );
  }
}
