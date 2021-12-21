import fs from 'fs';

import { PresentationSubmission } from '@sphereon/pe-models';

import { EvaluationClient, InternalVerifiableCredential, VerifiablePresentation } from '../../lib';
import { SubjectIsHolderEvaluationHandler } from '../../lib/evaluation/handlers';
import { InternalPresentationDefinitionV1 } from '../../lib/types/SSI.types';
import { SSITypesBuilder } from '../../lib/types/SSITypesBuilder';

function getFile(
  path: string
): InternalPresentationDefinitionV1 | VerifiablePresentation | InternalVerifiableCredential {
  const file = JSON.parse(fs.readFileSync(path, 'utf-8'));
  if (Object.keys(file).includes('presentation_definition')) {
    return file.presentation_definition as InternalPresentationDefinitionV1;
  } else if (Object.keys(file).includes('presentation_submission')) {
    return file as VerifiablePresentation;
  } else {
    return file as InternalVerifiableCredential;
  }
}

const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';

describe('SubjectIsHolderEvaluationHandler tests', () => {
  it(`input descriptor's constraints.is_holder is present`, () => {
    const presentationDefinition: InternalPresentationDefinitionV1 = getFile(
      './test/resources/pd_require_is_holder.json'
    ) as InternalPresentationDefinitionV1;
    const results = getFile('./test/resources/isHolderEvaluationResults.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: SubjectIsHolderEvaluationHandler = new SubjectIsHolderEvaluationHandler(evaluationClient);
    const presentation: VerifiablePresentation = getFile(
      './test/dif_pe_examples/vp/vp_subject_is_holder.json'
    ) as VerifiablePresentation;
    evaluationClient.presentationSubmission = presentation.presentation_submission as PresentationSubmission;
    evaluationClient.verifiableCredential = SSITypesBuilder.mapExternalVerifiableCredentialsToInternal(
      presentation.verifiableCredential
    );
    evaluationClient.dids = [HOLDER_DID];
    evaluationHandler.handle(
      presentationDefinition,
      SSITypesBuilder.mapExternalVerifiableCredentialsToInternal(presentation.verifiableCredential)
    );
    expect(evaluationHandler.client.results).toEqual(results);
  });
});
