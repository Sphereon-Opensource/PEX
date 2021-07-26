import fs from 'fs';

import {PresentationDefinition} from '@sphereon/pe-models';

import {Status} from '../../lib';
import {EvaluationHandler} from "../../lib/evaluation/evaluationHandler";
import {HandlerCheckResult} from "../../lib/evaluation/handlerCheckResult";
import {UriEvaluationHandler} from "../../lib/evaluation/uriEvaluationHandler";

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

  it('should return error for not matching (exactly) any URI for the schema of the candidate input with one of the Input Descriptor schema object uri values.', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    vpSimple.verifiableCredential[0].credentialSchema[0].id = "https://www.test.org/mock"
    const evaluationHandler: EvaluationHandler = new UriEvaluationHandler();
    const results: HandlerCheckResult[] = [];
    evaluationHandler.handle(pdSchema, vpSimple, results);
    expect(results[0]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', "$.verifiableCredential[0]", "UriEvaluation", Status.ERROR, "presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly."));
  });
});