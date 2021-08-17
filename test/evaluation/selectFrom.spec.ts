import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClientWrapper } from '../../lib/evaluation/evaluationClientWrapper';
import { SelectResults } from '../../lib/evaluation/core/selectResults';

function getFile(path: string) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('Select from tests', () => {
    it('Evaluate submission requirements all from group A', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[0]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        const result: SelectResults = evaluationClientWrapper.selectFrom(pdSchema, vpSimple);
        expect(result).toEqual({
            "matches": [
                {
                    "count": 3, 
                    "from": ["A"], 
                    "matches": ["$.verifiableCredential[0]", "$.verifiableCredential[1]", "$.verifiableCredential[2]"], 
                    "name": "Submission of educational transcripts", 
                    "rule": "all"
                }
            ], 
            "warnings": []
            }
        );
      });
    
      it('Evaluate submission requirements min 2 from group B', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[1]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        const result: SelectResults = evaluationClientWrapper.selectFrom(pdSchema, vpSimple);
        expect(result).toEqual({
            "matches": [
                {
                    "count": 2, 
                    "from": ["B"], 
                    "matches": [
                        "$.verifiableCredential[1]", 
                        "$.verifiableCredential[2]"
                    ], 
                    "name": "Eligibility to Work Proof", 
                    "rule": "pick"}
                ], 
                    "warnings": []
                });
      });
    
      it('Evaluate submission requirements either all from group A or 2 from group B', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[2]];
        pdSchema.input_descriptors = [pdSchema.input_descriptors[0], pdSchema.input_descriptors[1]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        const result: SelectResults = evaluationClientWrapper.selectFrom(pdSchema, vpSimple);
        expect(result).toEqual({
            "matches": [
                {
                    "count": 1, 
                    "from_nested": [
                        {
                            "count": 2, 
                            "from": ["A"], 
                            "matches": [
                                "$.verifiableCredential[0]", 
                                "$.verifiableCredential[1]"
                            ], 
                            "name": undefined, 
                            "rule": "all"
                        }, 
                        {
                            "count": 1, 
                            "from": ["B"], 
                            "matches": [
                                "$.verifiableCredential[1]"
                            ], 
                            "name": undefined, 
                            "rule": "pick"
                        }
                    ], 
                    "matches": [], 
                    "name": 
                    "Confirm banking relationship or employment and residence proofs", 
                    "rule": "pick"
                }
            ], 
            "warnings": []
        });
      });
    
      it('Evaluate submission requirements max 2 from group B', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[3]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        const result: SelectResults = evaluationClientWrapper.selectFrom(pdSchema, vpSimple);
        expect(result).toEqual({
            "matches": [
                {
                    "count": 2, 
                    "from": ["B"], 
                    "matches": [
                        "$.verifiableCredential[1]", 
                        "$.verifiableCredential[2]"
                    ], 
                    "name": "Eligibility to Work Proof", 
                    "rule": "pick"
                }
            ], 
            "warnings": []});
      });

    it('Evaluate submission requirements all from group A and 2 from group B', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[8]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        const result: SelectResults = evaluationClientWrapper.selectFrom(pdSchema, vpSimple);
        expect(result).toEqual({
            "matches": [
                {
                    "count": 1, 
                    "from_nested": [
                        {
                            "count": 3, 
                            "from": ["A"], 
                            "matches": [
                                "$.verifiableCredential[0]", 
                                "$.verifiableCredential[1]", 
                                "$.verifiableCredential[2]"
                            ], 
                            "name": undefined, 
                            "rule": "all"
                        }, 
                        {
                            "count": 2, 
                            "from": ["B"], 
                            "matches": [
                                "$.verifiableCredential[1]", 
                                "$.verifiableCredential[2]"
                            ], 
                            "name": undefined, 
                            "rule": "pick"
                        }
                    ], 
                    "matches": [], 
                    "name": "Confirm banking relationship or employment and residence proofs", 
                    "rule": "all"
                }
            ], 
            "warnings": []
        });
      });

        it('Evaluate submission requirements min 1: (all from group A or 2 from group B)', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[9]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        const result: SelectResults = evaluationClientWrapper.selectFrom(pdSchema, vpSimple);
        expect(result).toEqual({
            "matches": [
                {
                    "count": 1, 
                    "from_nested": [
                        {
                            "count": 3, 
                            "from": ["A"], 
                            "matches": [
                                "$.verifiableCredential[0]", 
                                "$.verifiableCredential[1]", 
                                "$.verifiableCredential[2]"
                            ], 
                            "name": undefined, 
                            "rule": "all"
                        }, 
                        {
                            "count": 2, 
                            "from": ["B"], 
                            "matches": [
                                "$.verifiableCredential[1]", 
                                "$.verifiableCredential[2]"
                            ], 
                            "name": undefined, 
                            "rule": "pick"
                        }
                    ], 
                    "matches": [], 
                    "name": "Confirm banking relationship or employment and residence proofs", 
                    "rule": "pick"
                }
            ], 
            "warnings": []
        });
      });
    
      it('Evaluate submission requirements max 2: (all from group A and 2 from group B)', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[10]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        const result: SelectResults = evaluationClientWrapper.selectFrom(pdSchema, vpSimple);
        expect(result).toEqual({
            "matches": [
                {
                    "count": 1, 
                    "from_nested": [
                        {
                            "count": 3, 
                            "from": ["A"], 
                            "matches": [
                                "$.verifiableCredential[0]", 
                                "$.verifiableCredential[1]", 
                                "$.verifiableCredential[2]"
                            ], 
                            "name": undefined, 
                            "rule": "all"
                        }, 
                        {
                            "count": 2, 
                            "from": ["B"], 
                            "matches": [
                                "$.verifiableCredential[1]", 
                                "$.verifiableCredential[2]"
                            ], 
                            "name": undefined, 
                            "rule": "pick"
                        }
                    ], 
                    "matches": [], 
                    "name": "Confirm banking relationship or employment and residence proofs", 
                    "rule": "pick"
                }
            ], 
            "warnings": []
        });
      });
    
      it('Evaluate submission requirements min 3 from group B', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[4]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        expect(() => evaluationClientWrapper.selectFrom(pdSchema, vpSimple)).toThrowError('Min: expected: 3 actual: 2 at level: 0');
      });
    
      it('Evaluate submission requirements max 1 from group B', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[5]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        expect(() => evaluationClientWrapper.selectFrom(pdSchema, vpSimple)).toThrowError('Max: expected: 1 actual: 2 at level: 0');
      });
    
      it('Evaluate submission requirements exactly 1 from group B', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[6]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        expect(() => evaluationClientWrapper.selectFrom(pdSchema, vpSimple)).toThrowError('Count: expected: 1 actual: 2 at level: 0');
      });
    
      it('Evaluate submission requirements all from group B', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[7]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        expect(() => evaluationClientWrapper.selectFrom(pdSchema, vpSimple)).toThrowError('Not all input descriptors are members of group B');
      });
    
      it('Evaluate submission requirements min 3: (all from group A or 2 from group B + unexistent)', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[11]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        expect(() => evaluationClientWrapper.selectFrom(pdSchema, vpSimple)).toThrowError('Min: expected: 3 actual: 2 at level: 1');
      });
    
      it('Evaluate submission requirements max 1: (all from group A and 2 from group B)', () => {
        const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
        const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
        pdSchema.submission_requirements = [pdSchema.submission_requirements[12]];
        const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper(); 
        evaluationClientWrapper.evaluate(pdSchema, vpSimple);
        expect(() => evaluationClientWrapper.selectFrom(pdSchema, vpSimple)).toThrowError('Max: expected: 1 actual: 2 at level: 1');
      });
});