import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { Presentation, SubjectIsHolderEvaluationHandler, VP } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation/evaluationClient';

function getFile(path: string): unknown {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';

describe('SubjectIsHolderEvaluationHandler tests', () => {

  it(`input descriptor's constraints.is_holder is present`, () => {
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_require_is_holder.json')['presentation_definition'];
    const results = getFile('./test/resources/isHolderEvaluationResults.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: SubjectIsHolderEvaluationHandler = new SubjectIsHolderEvaluationHandler(evaluationClient);
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_subject_is_holder.json');
    const presentation: Presentation = new Presentation(inputCandidates['@context'], inputCandidates['presentation_submission'], inputCandidates['type'], inputCandidates['verifiableCredential'], inputCandidates['holder'], inputCandidates['proof']);
    evaluationClient.verifiablePresentation = new VP(presentation);
    evaluationClient.did = HOLDER_DID;
    evaluationHandler.handle(presentationDefinition);
    expect(evaluationHandler.client.results).toEqual(results);
  });
});