import { PresentationDefinition } from '@sphereon/pe-models';
import fs from 'fs';
import { Checked, Status } from '../../lib';
import { EvaluationResultHolder } from '../../lib/evaluation/evaluationResultHolder';
import { SubmissionMarked } from '../../lib/evaluation/submissionMarked';

function getFile(path: string) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('Presentation Submission readiness test', () => {

    it(`All verifiable credentials should be marked for presentation submission`, () => {
        const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const expected: Array<SubmissionMarked> = [
            {
                inputDescriptor: pdSchema.input_descriptors[0],
                group: undefined,
                inputCandidate: vpSimple.verifiableCredential[0]
            },
            {
                inputDescriptor: pdSchema.input_descriptors[0],
                group: undefined,
                inputCandidate: vpSimple.verifiableCredential[1]
            },
            {
                inputDescriptor: pdSchema.input_descriptors[0],
                group: undefined,
                inputCandidate: vpSimple.verifiableCredential[2]
            }
        ]
        const evaluationResultHolder = new EvaluationResultHolder();
        evaluationResultHolder.initializeVCMap(pdSchema, vpSimple);
        const result = evaluationResultHolder.markForPresentationSubmission();
        expect(result).toEqual(expected);
    });

    it(`Two out three verifiable credentials should be marked for presentation submission`, () => {
        const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const expected: Array<SubmissionMarked> = [
            {
                inputDescriptor: pdSchema.input_descriptors[0],
                group: undefined,
                inputCandidate: vpSimple.verifiableCredential[0]
            },
            {
                inputDescriptor: pdSchema.input_descriptors[0],
                group: undefined,
                inputCandidate: vpSimple.verifiableCredential[1]
            }
        ]
        const evaluationResultHolder = new EvaluationResultHolder();
        evaluationResultHolder.initializeVCMap(pdSchema, vpSimple);
        evaluationResultHolder.getVcMap().get(pdSchema.input_descriptors[0]).set(vpSimple.verifiableCredential[2], new Checked('root.input_descriptors', Status.ERROR, `The path property didn't match`));
        const result = evaluationResultHolder.markForPresentationSubmission();
        expect(result).toEqual(expected);
    });    
});