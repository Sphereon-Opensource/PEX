import { PresentationDefinition } from '@sphereon/pe-models';

import { Evaluation } from '../core';

import { EvaluationBundler } from './evaluationBundler';

export class CandidateInputFitsInputDescriptorEB extends EvaluationBundler<PresentationDefinition, unknown> {
  constructor(parentTag: string) {
    super(parentTag, 'presentation_definition');
  }

  public getEvaluations(d: PresentationDefinition, p: unknown): Evaluation<PresentationDefinition, unknown>[] {
    return [
      {
        tag: this.getTag(),
        target: { d, p },
        predicate: (d, p) => p != null && d != null,
        message: 'presentation_definition should be non null.',
      },
      {
        tag: this.getTag(),
        target: { d, p },
        predicate: CandidateInputFitsInputDescriptorEB.evaluateUri,
        message:
          'presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
      },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static evaluateUri(pd: PresentationDefinition, psw: any): boolean {
    const uriArrays: string[][] = pd.input_descriptors.map((inDesc) => inDesc.schema.map((so) => so.uri));
    let uris = [];
    uris = uris.concat.apply([], uriArrays);

    for (let i = 0; i < psw.verifiableCredential.length; i++) {
      const vc = psw.verifiableCredential[i];
      const vcInContext = CandidateInputFitsInputDescriptorEB.getVC(vc);
      if (!CandidateInputFitsInputDescriptorEB.stringIsPresentInList(vcInContext, uris)) {
        /**
         * TODO we need to collect all the inputs/credentials present in presentation which fit the presentation definition.
         * Because when PE-JS is working on Holder side it will tell holder which credentials the Holder can send to Verifier.
         * And when PE-JS is working on Verifier side it will be able to tell the verifier if the presentation is as verifier's desired presentation definition.
         */
        return false;
      }

      // TOOD returning true keep track of what matched.
    }

    return true;
  }

  private static getVC(vc) {
    let presentationDefinitionUri = '';
    if (vc.vc) {
      presentationDefinitionUri = vc.vc['@context'];
    } else if (vc['@context']) {
      presentationDefinitionUri = vc['@context'];
    }
    return presentationDefinitionUri;
  }

  private static stringIsPresentInList(presentationDefinitionUri: string, input_descriptors_uri: string[]): boolean {
    // TODO extract to generic utils or use something like lodash
    return (
      presentationDefinitionUri != null &&
      presentationDefinitionUri != '' &&
      input_descriptors_uri.find((el) => el === presentationDefinitionUri) != undefined
    );
  }
}
