import fs from 'fs';

import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../../lib';
import { EvaluationClient } from "../../lib/evaluation/evaluationClient";

function getFile(path: string) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

    it('should report error if the predicate is present and filter is not', function () {
        const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
        delete pdSchema.input_descriptors[0].constraints.fields[0].filter;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
        const evaluationClient: EvaluationClient = new EvaluationClient();
        try {
            evaluationClient.runEvaluations(pdSchema, vpSimple);
        } catch (e) {
            expect(e.message).toEqual("if in the field we have predicate value, the filter value should be present as well.")
        }
    });
});