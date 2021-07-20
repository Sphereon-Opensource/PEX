import fs from 'fs';
import { PresentationDefinition } from "@sphereon/pe-models";
import { InputDescriptorFilterEvaluationHandler } from "../../lib/evaluation/inputDescriptorFilterEvaluationHandler";
import { Checked, Status } from '../../lib';

function getFile(path: string): any {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('inputDescriptorFilterEvaluationHandler tests', () => {

    it(`input descriptor's constraint property missing`, () => {
        const inputCandidate: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json')['verifiableCredential'][0];
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]]
        const filterEvaluationHandler = new InputDescriptorFilterEvaluationHandler();
        const result = filterEvaluationHandler.handle(presentationDefinition, inputCandidate);
        expect(result).toEqual(null);
    });

    it(`input descriptor's constraints.fields property missing`, () => {
        const inputCandidate: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json')['verifiableCredential'][0];
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[1]]
        const filterEvaluationHandler = new InputDescriptorFilterEvaluationHandler();
        const result = filterEvaluationHandler.handle(presentationDefinition, inputCandidate);
        expect(result).toEqual(null);
    });

    it(`input descriptor's constraints.fields.length is equal to 0`, () => {
        const inputCandidate: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json')['verifiableCredential'][0];
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[2]]
        const filterEvaluationHandler = new InputDescriptorFilterEvaluationHandler();
        const result = filterEvaluationHandler.handle(presentationDefinition, inputCandidate);
        expect(result).toEqual(null);
    });

    it(`input descriptor's constraints.fields.path does not match`, () => {
        const inputCandidate: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json')['verifiableCredential'][0];
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[3]]
        const filterEvaluationHandler = new InputDescriptorFilterEvaluationHandler();
        const result = filterEvaluationHandler.handle(presentationDefinition, inputCandidate);
        expect(result).toEqual(new Checked("root.input_descriptors", Status.ERROR, "The input candidate does not satisfy any filters of the input descriptors"));
    });

    it(`input descriptor's constraints.fields.filter does not match`, () => {
        const inputCandidate: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json')['verifiableCredential'][0];
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[4]]
        const filterEvaluationHandler = new InputDescriptorFilterEvaluationHandler();
        const result = filterEvaluationHandler.handle(presentationDefinition, inputCandidate);
        expect(result).toEqual(new Checked("root.input_descriptors", Status.ERROR, "The input candidate does not satisfy any filters of the input descriptors"));
    });

    it(`input descriptor's constraint.fields.filter match`, () => {
        const inputCandidate: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json')['verifiableCredential'][0];
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[5]]
        const filterEvaluationHandler = new InputDescriptorFilterEvaluationHandler();
        const result = filterEvaluationHandler.handle(presentationDefinition, inputCandidate);
        expect(result).toEqual(null);
    });
});
