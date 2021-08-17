import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { Status, VP } from '../../lib';
import { EvaluationClient } from "../../lib/evaluation/evaluationClient";
import { HandlerCheckResult } from "../../lib/evaluation/handlerCheckResult";
import { UriEvaluationHandler } from "../../lib/evaluation/uriEvaluationHandler";

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

  it('should return ok if uris match in vpSimple.verifiableCredential[0].credentialSchema[0].id', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pdSchema, new VP(vpSimple));
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return error for not matching (exactly) any URI for the schema of the candidate input with one of the Input Descriptor schema object uri values.', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    vpSimple.verifiableCredential[0].credentialSchema[0].id = "https://www.test.org/mock"
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pdSchema, new VP(vpSimple));
    expect(evaluationHandler.getResults()[0]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', "$.verifiableCredential[0]", "UriEvaluation", Status.ERROR, "presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.", {
      "presentationDefinitionUri": "https://www.test.org/mock",
      "inputDescriptorsUris": [
        "https://www.w3.org/TR/vc-data-model/#types"
      ]
    }));
  });

 it('should generate 6 error result fo this test case.', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/input_descriptor_filter_examples.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
   evaluationHandler.handle(pdSchema, new VP(vpSimple));
   const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
   expect(errorResults.length).toEqual(6);
  });

  it('should generate 5 error result and 1 info.', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/input_descriptor_filter_examples.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json')
    pdSchema.input_descriptors[0].schema[0].uri = "https://business-standards.org/schemas/employment-history.json";
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pdSchema, new VP(vpSimple));
    const errorResults = evaluationClient.results.filter(result => result.status === Status.ERROR);
    const infoResults = evaluationClient.results.filter(result => result.status === Status.INFO);
    expect(errorResults.length).toEqual(5);
    expect(infoResults.length).toEqual(1);
  });
});