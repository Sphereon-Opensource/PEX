import fs from 'fs';

import { Status, VerifiableCredential, VerifiablePresentation } from '../../lib';
import { EvaluationClient, HandlerCheckResult } from '../../lib';
import { UriEvaluationHandler } from '../../lib/evaluation/handlers';
import {
  PresentationDefinitionV1,
  VerifiableCredentialJsonLD,
  VerifiableCredentialJwt,
} from '../../lib/types/SSI.types';
import { SSITypesBuilder } from '../../lib/types/SSITypesBuilder';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {
  it('should return ok if uris match in vpSimple.verifiableCredential[0].credentialSchema[0].id', () => {
    const pdSchema: PresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(pdSchema);
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    evaluationHandler.handle(pd, [vc]);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return error for not matching (exactly) any URI for the schema of the candidate input with one of the Input Descriptor schema object uri values.', () => {
    const pdSchema: PresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(pdSchema);
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    vc['@context'] = ['https://www.test.org/mock'];
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pd, [vc]);
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
    const pdSchema: PresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/input_descriptor_filter_examples.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(pdSchema);
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    let vc: VerifiableCredential = new VerifiableCredentialJwt();
    vc = Object.assign(vc, vpSimple.verifiableCredential[0]);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pd, [vc]);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(2);
  });

  it('should generate 5 error result and 1 info.', () => {
    const pdSchema: PresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pd/input_descriptor_filter_examples.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(pdSchema);
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    let vc0: VerifiableCredential = new VerifiableCredentialJwt();
    vc0 = Object.assign(vc0, vpSimple.verifiableCredential[0]);
    let vc1: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc1 = Object.assign(vc1, vpSimple.verifiableCredential[1]);
    let vc2: VerifiableCredential = new VerifiableCredentialJsonLD();
    vc2 = Object.assign(vc2, vpSimple.verifiableCredential[2]);
    pdSchema.input_descriptors[0].schema[0].uri = 'https://business-standards.org/schemas/employment-history.json';
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pd, [vc0, vc1, vc2]);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    const infoResults = evaluationClient.results.filter((result) => result.status === Status.INFO);
    expect(errorResults.length).toEqual(5);
    expect(infoResults.length).toEqual(1);
  });
});
