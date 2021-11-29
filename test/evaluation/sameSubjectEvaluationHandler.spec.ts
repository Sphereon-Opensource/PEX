import { EvaluationClient } from '../../lib';
import { SameSubjectEvaluationHandler } from '../../lib/evaluation/handlers';
import { PdRequireSameSubject } from '../test_data/sameSubjectEvaluationHandler/pdRequireSameSubject';
import { SameSubjectHandlerCheckResults } from '../test_data/sameSubjectEvaluationHandler/sameSubjectEvaluationResults';
import { SameSubjectPresentationSubmission } from '../test_data/sameSubjectEvaluationHandler/sameSubjectPresentationSubmission';
import { SameSubjectVerifiableCredential } from '../test_data/sameSubjectEvaluationHandler/verifiableCredentials';

describe('sameSubjectEvaluationHandler', () => {
  it('Should record as success when the fields requiring same subject belong to same subjects', () => {
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
