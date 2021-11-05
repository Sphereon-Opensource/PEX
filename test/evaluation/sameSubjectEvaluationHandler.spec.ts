import { EvaluationClient, SameSubjectEvaluationHandler } from '../../lib';
import { PdRequireSameSubject } from '../test_data/sameSubjectEvaluationHandler/pdRequireSameSubject';
import { SameSubjectHandlerCheckResults } from '../test_data/sameSubjectEvaluationHandler/sameSubjectEvaluationResults';
import { SameSubjectPresentationSubmission } from '../test_data/sameSubjectEvaluationHandler/sameSubjectPresentationSubmission';
import { SameSubjectVerifiableCredential } from '../test_data/sameSubjectEvaluationHandler/verifiableCredentials';

describe('sameSubjectEvaluationHandler', () => {
  it('Should record as success when the fields requiring same subject belong to same subjects', () => {
    const pd: PresentationDefinition = getFile('./test/resources/pdRequireSameSubject.ts').presentation_definition;
    const results = getFile('./test/resources/sameSubjectEvaluationResults.ts');

    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.presentationSubmission = new SameSubjectPresentationSubmission().getPresentationSubmission();
    evaluationClient.verifiableCredential = new SameSubjectVerifiableCredential().getVerifiableCredential();
    const evaluationHandler: SameSubjectEvaluationHandler = new SameSubjectEvaluationHandler(evaluationClient);

    evaluationHandler.handle(
      new PdRequireSameSubject().getPresentationDefinition(),
      evaluationClient.verifiableCredential
    );

    expect(evaluationHandler.client.results).toEqual(
      new SameSubjectHandlerCheckResults().getSameSubjectHandlerCheckResult()
    );
  });
});
