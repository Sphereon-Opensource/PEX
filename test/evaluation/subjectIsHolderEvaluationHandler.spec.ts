import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { SubjectIsHolderEvaluationHandler, VerifiablePresentation } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation/evaluationClient';

function getFile(path: string): unknown {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';

describe('SubjectIsHolderEvaluationHandler tests', () => {

  it(`input descriptor's constraints.is_holder is present`, () => {
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_require_is_holder.json') as PresentationDefinition;
    const results = getFile('./test/resources/isHolderEvaluationResults.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: SubjectIsHolderEvaluationHandler = new SubjectIsHolderEvaluationHandler(evaluationClient);
    const inputCandidates: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_subject_is_holder.json') as VerifiablePresentation;
    const presentation: VerifiablePresentation = {
      '@context': inputCandidates['@context'],
      presentationSubmission: inputCandidates['presentationSubmission'],
      type: inputCandidates['type'],
      verifiableCredential: inputCandidates['verifiableCredential'],
      holder: inputCandidates['holder'],
      proof: inputCandidates['proof']
    };
    evaluationClient.verifiablePresentation = presentation;
    evaluationClient.did = HOLDER_DID;
    evaluationHandler.handle(presentationDefinition);
    expect(evaluationHandler.client.results).toEqual(results);
  });
});