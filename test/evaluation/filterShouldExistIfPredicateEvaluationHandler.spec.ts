import fs from 'fs';

import {PresentationDefinition} from '@sphereon/pe-models';

import {Status} from "../../lib";
import {HandlerCheckResult} from "../../lib/evaluation/HandlerCheckResult";
import {EvaluationHandler} from "../../lib/evaluation/evaluationHandler";
import {FilterShouldExistIfPredicateEvaluationHandler} from "../../lib/evaluation/filterShouldExistIfPredicateEvaluationHandler";

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

  it('should report error if the predicate is present and filter is not', function () {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    delete pdSchema.input_descriptors[0].constraints.fields[0].filter;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationHandler: EvaluationHandler = new FilterShouldExistIfPredicateEvaluationHandler();
    const result: HandlerCheckResult[] = evaluationHandler.handle(pdSchema, vpSimple);
    expect(result[0]).toEqual(new HandlerCheckResult('root.input_descriptors[0].constraints.fields[0]', '', 'FilterShouldExistIfPredicate', Status.ERROR, "if in the field we have predicate value, the filter value should be present as well."));
  });
});