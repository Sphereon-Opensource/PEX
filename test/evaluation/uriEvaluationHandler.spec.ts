import fs from 'fs';

import {InputDescriptor, PresentationDefinition} from '@sphereon/pe-models';

import {Checked, Status} from '../../lib';
import {EvaluationClient} from "../../lib/evaluation/evaluationClient";

function getFile(path: string) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

    it('should return error for not matching (exactly) any URI for the schema of the candidate input with one of the Input Descriptor schema object uri values.', () => {
        const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
        vpSimple.verifiableCredential[0].credentialSchema[0].id = "https://www.test.org/mock"
        const evaluationClient: EvaluationClient = new EvaluationClient();
        const result: Map<InputDescriptor, Map<unknown, Checked>> = evaluationClient.runEvaluations(pdSchema, vpSimple);
        expect(result.get(pdSchema.input_descriptors[0]).get(vpSimple.verifiableCredential[0])).toEqual(new Checked('root.input_descriptor', Status.ERROR, "presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly."));
    });
});