import fs from 'fs';
import { PresentationDefinition } from "@sphereon/pe-models";

import { Status } from '../../lib';
import { InputDescriptorFilterEvaluationHandler } from '../../lib/evaluation/inputDescriptorFilterEvaluationHandler';
import { EvaluationResultHolder } from '../../lib/evaluation/evaluationResultHolder';
import { HandlerCheckResult } from '../../lib/evaluation/handlerCheckResult';

const message: HandlerCheckResult = {
    input_descriptor_path: `$.input_descriptors[0]`,
    verifiable_credential_path: `$.verifiableCredential[0]`,
    evaluator: `FilterEvaluation`,
    status: Status.INFO,
    message: 'Input candidate valid for presentation submission'
}

function getFile(path: string): any {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('inputDescriptorFilterEvaluationHandler tests', () => {

    it(`input descriptor's constraint property missing`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]];
        const message1 = { ...message, ['verifiable_credential_path']: '$.verifiableCredential[1]' };
        const message2 = { ...message, ['verifiable_credential_path']: '$.verifiableCredential[2]' };
        new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        const actual = new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates);
        expect(actual).toEqual([message, message1, message2]);
    });

    it(`input descriptor's constraints.fields property missing`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[1]];
        const message1 = { ...message, ['verifiable_credential_path']: '$.verifiableCredential[1]' };
        const message2 = { ...message, ['verifiable_credential_path']: '$.verifiableCredential[2]' };
        new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        const actual = new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates);
        expect(actual).toEqual([message, message1, message2]);
    });

    it(`input descriptor's constraints.fields.length is equal to 0`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[2]];
        const message1 = { ...message, ['verifiable_credential_path']: '$.verifiableCredential[1]' };
        const message2 = { ...message, ['verifiable_credential_path']: '$.verifiableCredential[2]' };
        new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        const actual = new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates);
        expect(actual).toEqual([message, message1, message2]);
    });

    it(`input descriptor's constraints.fields.path does not match`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[3]];
        const message0 = { ...message, ['status']: Status.ERROR, ['message']: 'Input candidate failed to find jsonpath property' };
        const message1 = { ...message0, ['verifiable_credential_path']: '$.verifiableCredential[1]' };
        const message2 = { ...message0, ['verifiable_credential_path']: '$.verifiableCredential[2]' };
        new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        const actual = new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates);
        expect(actual).toEqual([message0, message1, message2]);
    });

    it(`input descriptor's constraints.fields.filter does not match`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[4]];
        const message0 = { ...message, ['status']: Status.ERROR, ['message']: 'Input candidate failed filter evaluation' };
        const message1 = { ...message0, ['verifiable_credential_path']: '$.verifiableCredential[1]' };
        const message2 = { ...message0, ['verifiable_credential_path']: '$.verifiableCredential[2]' };
        new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        const actual = new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates);
        expect(actual).toEqual([message0, message1, message2]);
    });

    it(`input descriptor's constraint.fields.filter match`, () => {
        const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
        presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[5]];
        const message1 = { ...message, ['verifiable_credential_path']: '$.verifiableCredential[1]' };
        const message2 = { ...message, ['verifiable_credential_path']: '$.verifiableCredential[2]' };
        new EvaluationResultHolder().initializeVCMap(presentationDefinition, inputCandidates);
        const actual = new InputDescriptorFilterEvaluationHandler().handle(presentationDefinition, inputCandidates);
        expect(actual).toEqual([message, message1, message2]);
    });
});
