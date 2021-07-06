import { Evaluation } from '../core';

import { EvaluationBundler } from './evaluationBundler';

export class PresentationDefinitionEB extends EvaluationBundler<any[]> {

  constructor(parentTag: string) {
    super(parentTag, 'presentation_definition');
  }

  public getEvaluations(params: any[]): Evaluation<unknown>[] {
    return [
      ...this.myEvaluations(params)
    ];
  }

  private myEvaluations(params: any[]): Evaluation<unknown>[] {
    return [
      // E Section 4.3.1   : The URI for the schema of the candidate input MUST match one of the Input Descriptor schema object uri values exactly.
      {
        tag: this.getTag(),
        target: params,
        predicate: (params) => params != null,
        message: 'presentation_definition should be non null.',
      },
      {
        tag: this.getTag(),
        target: params,
        predicate: PresentationDefinitionEB.getPredicate,
        message: 'presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
      },
    ];
  }

  private static getPredicate(params: any[]) : boolean {
    let uris: string[] = params[1].input_descriptors.map(id => id.schema.map(so => so.uri)).flat();
    // console.log(uris)
    return PresentationDefinitionEB.stringIsPresentInList(params[0].definition_id, uris);
  }

  private static stringIsPresentInList(presentation_definition_uri: string, input_descriptors_uri: string[]): boolean {
    // TODO extract to generic utils or use something like lodash
    console.log('>>>>> presentation_definition_uri:', presentation_definition_uri, 'input_descriptors_uri:',input_descriptors_uri)
    return presentation_definition_uri != null && input_descriptors_uri.find(el => el === presentation_definition_uri) != undefined;
  }

}
