import fs from 'fs';

import { InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';

import { Checked, EvaluationBundler, Status } from '../../../lib';
import { PredicateEB } from '../../../lib/evaluation/bundlers/predicateEB';
import { EvaluationEngine } from '../../../lib/evaluation/evaluationEngine';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {


  it('should report error if the predicate is present and filter is not', function () {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json');
    delete pdSchema.input_descriptors[0].constraints.fields[0].filter;

    const eb: EvaluationBundler<InputDescriptor[], unknown> = new PredicateEB('root');
    const  ee = new EvaluationEngine();
    const result = ee.evaluate([{bundler: eb, target: {d: pdSchema.input_descriptors, p: null}}])
    expect(result[0]).toEqual(new Checked('root.input_descriptor', Status.ERROR, 'if in the field we have predicate value, the filter value should be present as well.'));
    expect(result[1]).toEqual(new Checked('root.input_descriptor', Status.ERROR, 'verifiableCredential\'s matching predicate property should be boolean'));
  });

  //TODO: Talk to Hafeez It's handled by class casting
  it('should return error if value of predicate is not one of [required, preferred]', function () {
    const pdSchema = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json');
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
      }})
    expect(exceptionResults.length).toEqual(1);
    expect(exceptionResults[0]).toEqual(new Checked('root.input_descriptor', Status.ERROR, 'predicate value should be one of these values: [\'required\', \'preferred\']'));
  });

  it('should return error if verifiableCredential\'s matching property is not boolean', function () {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json');
    const vpSimple = getFile('./test/dif_pe_examples/pd/vp-simple-age-predicate.json');
    const eb: EvaluationBundler<InputDescriptor[], unknown> = new PredicateEB('root');
    const  ee = new EvaluationEngine();
    const result = ee.evaluate([{bundler: eb, target: {d: pdSchema.input_descriptors, p: vpSimple}}])
    expect(result[0]).toEqual(new Checked('root.input_descriptor', Status.ERROR, 'verifiableCredential\'s matching predicate property should be boolean'));
  });
});