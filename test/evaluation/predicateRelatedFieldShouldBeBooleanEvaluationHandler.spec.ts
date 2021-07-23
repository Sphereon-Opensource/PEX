import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../../lib';
import { EvaluationHandler } from "../../lib/evaluation/evaluationHandler";
import { HandlerCheckResult } from "../../lib/evaluation/handlerCheckResult";
import { PredicateRelatedFieldEvaluationHandler } from "../../lib/evaluation/predicateRelatedFieldEvaluationHandlerEvaluationHandler";

function getFile(path: string) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

    it('should return error if value of predicate is not one of [required, preferred]', function () {
        const pdSchema = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
        pdSchema.input_descriptors[0].constraints.fields[0].predicate = "necessary";
        const validPredicates = ['required', 'preferred'];
        const exceptionResults = [];
        pdSchema.input_descriptors.forEach(id => {
            if (id.constraints) {
                id.constraints.fields.forEach(f => {
                    if (!validPredicates.includes(f.predicate)) {
                        exceptionResults.push(new Checked('root.input_descriptor', Status.ERROR, 'predicate value should be one of these values: [\'required\', \'preferred\']'));
                    }
                })
            }
        })
        expect(exceptionResults.length).toEqual(1);
        expect(exceptionResults[0]).toEqual(new Checked('root.input_descriptor', Status.ERROR, 'predicate value should be one of these values: [\'required\', \'preferred\']'));
    });

    it('should return error if verifiableCredential\'s matching property is not boolean', function () {
        const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
        vpSimple.verifiableCredential["0"].age = 18;
        const evaluationHandler: EvaluationHandler = new PredicateRelatedFieldEvaluationHandler();
        const results: HandlerCheckResult[] = [];
        evaluationHandler.handle(pdSchema, vpSimple, results);
        expect(results[0]).toEqual(new HandlerCheckResult('root.input_descriptors[0].constraints.fields[0]', 'root.verifiableCredential[0]', 'PredicateRelatedField', Status.ERROR, "It's required to have the predicate related field is present in the verifiableCredential."));
    });
});