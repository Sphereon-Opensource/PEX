import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClient } from "../../lib/evaluation/evaluationClient";

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

  it('should return ok if verifiablePresentation doesn\'t have the etc field', function () {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0].etc).toEqual(undefined);
  });

  it('should return ok if verifiablePresentation doesn\'t have the birthPlace field', function () {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple);
    expect(evaluationClient.verifiablePresentation.verifiableCredential[0].birthPlace).toEqual(undefined);
  });
});