import fs from 'fs';

import {PresentationDefinition} from '@sphereon/pe-models';

import {
  EvaluationClient,
  EvaluationHandler,
  HandlerCheckResult,
  SameSubjectEvaluationHandler,
  Status,
  VP,
} from '../../lib';
import {Presentation} from "../../lib/verifiablePresentation/models";

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('sameSubjectEvaluationHandler', () => {

  it('Should record as success when the fields requiring same subject belong to same subjects', () => {
    const pd: PresentationDefinition = getFile('./test/resources/pd_require_same_subject.json').presentation_definition;
    const presentation: Presentation = getFile('./test/resources/vp_require_same_subject.json');
    const vp: VP = new VP(presentation);
    const evaluationHandler: EvaluationHandler = new SameSubjectEvaluationHandler(new EvaluationClient());
    evaluationHandler.handle(pd, vp as VP);
    expect(evaluationHandler).toEqual(
      new HandlerCheckResult(
        'a',
        'b',
        'SameSubjectEvaluationHandler',
        Status.ERROR,
        'The field ids requiring the same subject belong to same subject'));
  });

  // it('Should record as error when the fields requiring same subject do not belong to same subjects', () => {
  //   const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
  //   const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
  //   vpSimple.verifiableCredential[0].credentialSchema[0].id = "https://www.test.org/mock"
  //   const evaluationHandler: EvaluationHandler = new SameSubjectEvaluationHandler();
  //   const results: HandlerCheckResult[] = [];
  //   evaluationHandler.handle(pdSchema, vpSimple, results);
  //   expect(results[0]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', "$.verifiableCredential[0]", "UriEvaluation", Status.ERROR, "presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly."));
  // });
  //
  // it('Should record as warning when the fields preferring same subject do not belong to same subjects', () => {
  //   const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
  //   const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
  //   vpSimple.verifiableCredential[0].credentialSchema[0].id = "https://www.test.org/mock"
  //   const evaluationHandler: EvaluationHandler = new SameSubjectEvaluationHandler();
  //   const results: HandlerCheckResult[] = [];
  //   evaluationHandler.handle(pdSchema, vpSimple, results);
  //   expect(results[0]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', "$.verifiableCredential[0]", "UriEvaluation", Status.ERROR, "presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly."));
  // });

});