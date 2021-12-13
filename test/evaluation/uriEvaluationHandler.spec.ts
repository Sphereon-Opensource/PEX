import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { Status, VerifiablePresentation } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation/evaluationClient';
import { HandlerCheckResult } from '../../lib/evaluation/handlerCheckResult';
import { UriEvaluationHandler } from '../../lib/evaluation/handlers/uriEvaluationHandler';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {
  it('should return ok if uris match in vpSimple.verifiableCredential[0].credentialSchema[0].id', () => {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pdSchema, vpSimple.verifiableCredential);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return error for not matching (exactly) any URI for the schema of the candidate input with one of the Input Descriptor schema object uri values.', () => {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    vpSimple.verifiableCredential[0].getContext()[0] = 'https://www.test.org/mock';
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pdSchema, vpSimple.verifiableCredential);
    expect(evaluationHandler.getResults()[0]).toEqual(
      new HandlerCheckResult(
        '$.input_descriptors[0]',
        '$[0]',
        'UriEvaluation',
        Status.ERROR,
        '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
        {
          inputDescriptorsUris: ['https://www.w3.org/2018/credentials/v1'],
          presentationDefinitionUris: ['https://www.test.org/mock'],
        }
      )
    );
  });

  it('should generate 6 error result fo this test case.', () => {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/input_descriptor_filter_examples.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pdSchema, vpSimple.verifiableCredential);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(6);
  });

  it('should generate 5 error result and 1 info.', () => {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/input_descriptor_filter_examples.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.input_descriptors[0].schema[0].uri = 'https://business-standards.org/schemas/employment-history.json';
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pdSchema, vpSimple.verifiableCredential);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    const infoResults = evaluationClient.results.filter((result) => result.status === Status.INFO);
    expect(errorResults.length).toEqual(5);
    expect(infoResults.length).toEqual(1);
  });
});
