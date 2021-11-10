import fs from 'fs';

import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { SubjectIsHolderEvaluationHandler, VerifiableCredential, VerifiablePresentation } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation/evaluationClient';

function getFile(path: string): PresentationDefinition | VerifiablePresentation | VerifiableCredential {
  const file = JSON.parse(fs.readFileSync(path, 'utf-8'));
  if (Object.keys(file).includes('presentation_definition')) {
    return file.presentation_definition as PresentationDefinition;
  } else if (Object.keys(file).includes('presentation_submission')) {
    return file as VerifiablePresentation;
  } else {
    return file as VerifiableCredential
  }
}

const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';

describe('SubjectIsHolderEvaluationHandler tests', () => {

  it(`input descriptor's constraints.is_holder is present`, () => {
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_require_is_holder.json') as PresentationDefinition;
    const results = getFile('./test/resources/isHolderEvaluationResults.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: SubjectIsHolderEvaluationHandler = new SubjectIsHolderEvaluationHandler(evaluationClient);
    const presentation: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_subject_is_holder.json') as VerifiablePresentation;
    evaluationClient.presentationSubmission = presentation.presentation_submission as PresentationSubmission;
    evaluationClient.verifiableCredential = presentation.verifiableCredential
    evaluationClient.dids = [HOLDER_DID];
    evaluationHandler.handle(presentationDefinition, presentation.verifiableCredential);
    expect(evaluationHandler.client.results).toEqual(results);
  });
});