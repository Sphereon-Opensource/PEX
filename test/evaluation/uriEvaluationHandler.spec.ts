import fs from 'fs';

import { IVerifiablePresentation, Status } from '../../lib';
import { HandlerCheckResult } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation';
import { UriEvaluationHandler } from '../../lib/evaluation/handlers';
import { IJsonLDPresentation } from '../../lib/types';
import {
  InternalPresentationDefinitionV1,
  InternalVerifiableCredential,
  InternalVerifiableCredentialJsonLD,
  InternalVerifiableCredentialJwt,
} from '../../lib/types/Internal.types';
import PEMessages from '../../lib/types/Messages';
import { SSITypesBuilder } from '../../lib/types/SSITypesBuilder';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {
  it('should return ok if uris match in vpSimple.verifiableCredential[0].credentialSchema[0].id', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, (vpSimple as IJsonLDPresentation).verifiableCredential[0]);
    evaluationHandler.handle(pd, [vc]);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return error for not matching (exactly) any URI for the schema of the candidate input with one of the Input Descriptor schema object uri values.', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, (vpSimple as IJsonLDPresentation).verifiableCredential[0]);
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
        PEMessages.URI_EVALUATION_DIDNT_PASS,
        {
          inputDescriptorsUris: ['https://www.w3.org/2018/credentials/v1'],
          vcContext: ['https://www.test.org/mock'],
          vcCredentialSchema: [
            {
              id: 'https://www.w3.org/TR/vc-data-model/#types',
            },
          ],
        }
      )
    );
  });

  it('should generate 6 error result fo this test case.', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/input_descriptor_filter_examples.json'
    ).presentation_definition;
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJwt();
    vc = Object.assign(vc, (vpSimple as IJsonLDPresentation).verifiableCredential[0]);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pd, [vc]);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(2);
  });

  it('should generate 5 error result and 1 info.', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/input_descriptor_filter_examples.json'
    ).presentation_definition;
    pdSchema.input_descriptors[0].schema[0].uri = 'https://business-standards.org/schemas/employment-history.json';
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    let vc0: InternalVerifiableCredential = new InternalVerifiableCredentialJwt();
    vc0 = Object.assign(vc0, (vpSimple as IJsonLDPresentation).verifiableCredential[0]);
    let vc1: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc1 = Object.assign(vc1, (vpSimple as IJsonLDPresentation).verifiableCredential[1]);
    let vc2: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc2 = Object.assign(vc2, (vpSimple as IJsonLDPresentation).verifiableCredential[2]);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pd, [vc0, vc1, vc2]);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    const infoResults = evaluationClient.results.filter((result) => result.status === Status.INFO);
    expect(errorResults.length).toEqual(5);
    expect(infoResults.length).toEqual(1);
  });

  it('should generate 3 warn for Regular Hashlink (with URL encoded)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/input_descriptor_filter_examples.json'
    ).presentation_definition;
    pdSchema.input_descriptors[0].schema[0].uri = 'https://business-standards.org/schemas/employment-history.json';
    pdSchema.input_descriptors[0].schema.push({
      uri: 'hl:zm9YZpCjPLPJ4Epc:z3TSgXTuaHxY2tsArhUreJ4ixgw9NW7DYuQ9QTPQyLHy',
    });
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    let vc0: InternalVerifiableCredential = new InternalVerifiableCredentialJwt();
    vc0 = Object.assign(vc0, (vpSimple as IJsonLDPresentation).verifiableCredential[0]);
    let vc1: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc1 = Object.assign(vc1, (vpSimple as IJsonLDPresentation).verifiableCredential[1]);
    let vc2: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc2 = Object.assign(vc2, (vpSimple as IJsonLDPresentation).verifiableCredential[2]);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pd, [vc0, vc1, vc2]);
    const warnResults = evaluationClient.results.filter((result) => result.status === Status.WARN);
    expect(warnResults.length).toEqual(3);
  });

  it('should generate 3 warn for Hashlink as a query parameter', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/input_descriptor_filter_examples.json'
    ).presentation_definition;
    pdSchema.input_descriptors[0].schema[0].uri = 'https://business-standards.org/schemas/employment-history.json';
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://example.com/hw.txt?hl=zm9YZpCjPLPJ4Epc' });
    const pd = SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    let vc0: InternalVerifiableCredential = new InternalVerifiableCredentialJwt();
    vc0 = Object.assign(vc0, (vpSimple as IJsonLDPresentation).verifiableCredential[0]);
    let vc1: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc1 = Object.assign(vc1, (vpSimple as IJsonLDPresentation).verifiableCredential[1]);
    let vc2: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc2 = Object.assign(vc2, (vpSimple as IJsonLDPresentation).verifiableCredential[2]);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pd, [vc0, vc1, vc2]);
    const warnResults = evaluationClient.results.filter((result) => result.status === Status.WARN);
    expect(warnResults.length).toEqual(3);
  });
});
