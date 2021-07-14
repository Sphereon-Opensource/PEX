import { InputDescriptor } from '@sphereon/pe-models';
import fs from 'fs';

//import { PresentationDefinition } from "@sphereon/pe-models";

import { EvaluationBundler, InputDescriptorsEB } from '../../../lib';
import { Checked, Status } from '../../../lib/ConstraintUtils';
import { EvaluationEngine } from "../../../lib/evaluation/evaluationEngine";

  function getFile(path: string) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
  }

  describe('inputDefinitionEB tests', () => {
    it('Evaluate input candidate with valid path', () => {
        const vpGenral: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
        const basicID: InputDescriptor = getFile('./test/dif_pe_examples/pd/sr_basic.json')['presentation_definition']['input_descriptors'];
        const eb: EvaluationBundler<any, any> = new InputDescriptorsEB('root');
        const result = new EvaluationEngine().evaluate([{bundler: eb, target: {d: vpGenral, p: basicID}}]);
        expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
      });
    
      // it('Evaluate input candidate with valid path and filter', () => {
      //   const vpGenral: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
      //   const basicPD: InputDescriptor = getFile('./test/dif_pe_examples/pd/sr_basic.json');
      //   const eb: EvaluationBundler<any, any> = new InputDescriptorEB('root');
      //   const result = new EvaluationEngine().evaluate([{bundler: eb, target: {d: vpGenral, p: basicPD}}]);
      //   expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
      // });
      
    //   it('Evaluate input candidate with valid path, filter and predicate is present', () => {
    //     const testableInputDescriptors = getTestableInputDescriptors();
    //     const inputCandidate = fs.readFileSync('./test/dif_pe_examples/vp/vp_general.json', 'utf-8');
    //     const result = new InputDescriptorsVB('root').evaluateInput(testableInputDescriptors[2], 
    //                       jp.query(JSON.parse(inputCandidate), '$.verifiableCredential[*]')[2]);
    //     expect(result).toBe(true);
    //   });
    
    //   it('Evaluate input candidate with valid path, invalid filter and predicate is present', () => {
    //     const testableInputDescriptors = getTestableInputDescriptors();
    //     const inputCandidate = fs.readFileSync('./test/dif_pe_examples/vp/vp_general.json', 'utf-8');
    //     const result = new InputDescriptorsVB('root').evaluateInput(testableInputDescriptors[3], 
    //                       jp.query(JSON.parse(inputCandidate), '$.verifiableCredential[*]')[2]);
    //     expect(result).toEqual(false);
    //   });
    
    //   it('Evaluate input candidate with valid path, invalid filter and predicate is absent', () => {
    //     const testableInputDescriptors = getTestableInputDescriptors();
    //     const inputCandidate = fs.readFileSync('./test/dif_pe_examples/vp/vp_general.json', 'utf-8');
    //     const result = new InputDescriptorsVB('root').evaluateInput(testableInputDescriptors[4], 
    //                       jp.query(JSON.parse(inputCandidate), '$.verifiableCredential[*]')[2]);
    //     expect(result).toEqual("false");
    //   });
    
    //   it('Evaluate input candidate with no fields', () => {
    //     const testableInputDescriptors = getTestableInputDescriptors();
    //     const inputCandidate = fs.readFileSync('./test/dif_pe_examples/vp/vp_general.json', 'utf-8');
    //     const result = new InputDescriptorsVB('root').evaluateInput(testableInputDescriptors[5], 
    //                       jp.query(JSON.parse(inputCandidate), '$.verifiableCredential[*]')[2]);
    //     expect(result).toEqual(undefined);
    //   });
    
    //   it('Evaluate input candidate with invalid path', () => {
    //     const testableInputDescriptors = getTestableInputDescriptors();
    //     const inputCandidate = fs.readFileSync('./test/dif_pe_examples/vp/vp_general.json', 'utf-8');
    //     const result = new InputDescriptorsVB('root').evaluateInput(testableInputDescriptors[6], 
    //                       jp.query(JSON.parse(inputCandidate), '$.verifiableCredential[*]')[2]);
    //     expect(result).toEqual(undefined);
    //   });
    
    //   it('Evaluate all input candidate with path and filter and predicate', () => {
    //     const testableInputDescriptors = getTestableInputDescriptors();
    //     const inputCandidate = fs.readFileSync('./test/dif_pe_examples/vp/vp_general.json', 'utf-8');
    //     const expected =  [ "did:example:123", "did:example:123", true, true, "did:example:123", "false",
    //                         "did:foo:123", true, false, "false", "false", 
    //                         "did:foo:123", true, false, "false" ]
    //     const result = new InputDescriptorsVB('root').evaluateCandidates(testableInputDescriptors, JSON.parse(inputCandidate));
    //     expect(result).toEqual(expected);
    //   });
});