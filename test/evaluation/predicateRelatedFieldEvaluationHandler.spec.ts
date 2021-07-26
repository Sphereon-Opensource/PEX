import fs from 'fs';

import { Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../../lib';
import { EvaluationClient } from "../../lib/evaluation/evaluationClient";
import { HandlerCheckResult } from "../../lib/evaluation/handlerCheckResult";

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

  it('should return ok if payload value of PredicateRelatedField is integer', function () {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const results: HandlerCheckResult[] = evaluationClient.evaluate(pdSchema, vpSimple);
    expect(results[2]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'PredicateRelatedField', Status.INFO, "Input candidate valid for presentation submission", {
      "path": ["$", "age"],
      "value": 19
    }));
  });

  it('should return ok if payload value of PredicateRelatedField is boolean', function () {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].constraints.fields[0].predicate = Optionality.Preferred;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const results: HandlerCheckResult[] = evaluationClient.evaluate(pdSchema, vpSimple);
    expect(results[2]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'PredicateRelatedField', Status.INFO, "Input candidate valid for presentation submission", {
      "path": ["$", "age"],
      "value": true
    }));
  });

  it('should return error if verifiableCredential\'s age isn\'t available', function () {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    delete vpSimple.verifiableCredential[0].age;
    pdSchema.input_descriptors[0].constraints.fields[0].predicate = Optionality.Preferred;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const results: HandlerCheckResult[] = evaluationClient.evaluate(pdSchema, vpSimple);
    expect(results[1]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'FilterEvaluation', Status.ERROR, "Input candidate failed to find jsonpath property", {
      "result": [],
      "valid": false
    }));
  });

  it('should return ok if verifiableCredential\'s age value is matching the specification in the input descriptor', function () {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    pdSchema.input_descriptors[0].constraints.fields[0].predicate = Optionality.Preferred;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const results: HandlerCheckResult[] = evaluationClient.evaluate(pdSchema, vpSimple);
    expect(results[3]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'PredicateRelatedField', Status.INFO, "Input candidate valid for presentation submission", {"value":true, "path":["$","age"]}));
    expect(results[4]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'PredicateRelatedField', Status.INFO, "Input candidate valid for presentation submission", {"value":"eu", "path":["$","details","citizenship"]}));
  });
});