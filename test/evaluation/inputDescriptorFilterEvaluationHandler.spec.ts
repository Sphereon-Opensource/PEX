import fs from 'fs';
import { InputDescriptor, PresentationDefinition } from "@sphereon/pe-models";

import { Checked, Status } from '../../lib';
import { InputDescriptorFilterEvaluationHandler } from '../../lib/evaluation/inputDescriptorFilterEvaluationHandler';
import { EvaluationResultHolder } from '../../lib/evaluation/evaluationResultHolder';

function getFile(path: string): any {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('inputDescriptorFilterEvaluationHandler tests', () => {

    it(`input descriptor's constraint property missing`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]];
        const result: Map<InputDescriptor, Map<any, Checked>> = new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates, result);
        const actual = Array.from(result.get(presentationDefinition.input_descriptors[0]).values()).find(a => a !== null);
        expect(actual).toEqual(undefined);
    });

    it(`input descriptor's constraints.fields property missing`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[1]];
        const result: Map<InputDescriptor, Map<any, Checked>> = new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates, result);
        const actual = Array.from(result.get(presentationDefinition.input_descriptors[0]).values()).find(a => a !== null);
        expect(actual).toEqual(undefined);
    });

    it(`input descriptor's constraints.fields.length is equal to 0`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[2]];
        const result: Map<InputDescriptor, Map<any, Checked>> = new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates, result);
        const actual = Array.from(result.get(presentationDefinition.input_descriptors[0]).values()).find(a => a !== null);
        expect(actual).toEqual(undefined);
    });

    it(`input descriptor's constraints.fields.path does not match`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[3]];
        const result: Map<InputDescriptor, Map<any, Checked>> = new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates, result);
        const actual = Array.from(result.get(presentationDefinition.input_descriptors[0]).values()).find(a => a !== null);
        expect(actual).toEqual(new Checked('root.input_descriptors', Status.ERROR, `The path property didn't match`));
    });

    it(`input descriptor's constraints.fields.filter does not match`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[4]]
        const result: Map<InputDescriptor, Map<any, Checked>> = new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates, result);
        const actual = Array.from(result.get(presentationDefinition.input_descriptors[0]).values()).find(a => a !== null);
        expect(actual).toEqual(new Checked("root.input_descriptors", Status.ERROR, `The filter property didn't match`));
    });

    it(`input descriptor's constraint.fields.filter match`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[5]]
        const result: Map<InputDescriptor, Map<any, Checked>> = new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates, result);
        const actual = Array.from(result.get(presentationDefinition.input_descriptors[0]).values()).find(a => a !== null);
        expect(actual).toEqual(undefined);
    });
});
