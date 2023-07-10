import fs from 'fs';

import { IVerifiableCredential, IVerifiablePresentation, OriginalType, WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { HandlerCheckResult, Status } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation';
import { UriEvaluationHandler } from '../../lib/evaluation/handlers';
import { InternalPresentationDefinitionV1, SSITypesBuilder } from '../../lib/types';
import PexMessages from '../../lib/types/Messages';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {
  it('should return ok if uris match in vpSimple.verifiableCredential![0].credentialSchema[0].id', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    const wvc: WrappedVerifiableCredential = {
      credential: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      decoded: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      format: 'ldp',
      original: vpSimple.verifiableCredential![0],
      type: OriginalType.JSONLD,
    };
    evaluationHandler.handle(pd, [wvc]);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return error for not matching (exactly) any URI for the schema of the candidate input with one of the Input Descriptor schema object uri values.', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const vc: IVerifiableCredential = vpSimple.verifiableCredential![0] as IVerifiableCredential;
    vc['@context' as keyof IVerifiableCredential] = ['https://www.test.org/mock'];
    const wvc: WrappedVerifiableCredential = {
      credential: vc as IVerifiableCredential,
      decoded: vc,
      format: 'ldp',
      original: vc,
      type: OriginalType.JSONLD,
    };
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pd, [wvc]);
    expect(evaluationHandler.getResults()[0]).toEqual(
      new HandlerCheckResult('$.input_descriptors[0]', '$[0]', 'UriEvaluation', Status.ERROR, PexMessages.URI_EVALUATION_DIDNT_PASS, {
        format: 'ldp',
        inputDescriptorsUris: ['https://www.w3.org/2018/credentials/v1'],
        vcContext: ['https://www.test.org/mock'],
        vcCredentialSchema: [
          {
            id: 'https://www.w3.org/TR/vc-data-model/#types',
          },
        ],
      }),
    );
  });

  it('should generate 6 error result fo this test case.', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/input_descriptor_filter_examples.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const vc: IVerifiableCredential = vpSimple.verifiableCredential![0] as IVerifiableCredential;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    const wvc: WrappedVerifiableCredential = {
      credential: vc as IVerifiableCredential,
      decoded: vc,
      format: 'ldp',
      original: vc,
      type: OriginalType.JSONLD,
    };
    evaluationHandler.handle(pd, [wvc]);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(2);
  });

  it('should generate 5 error result and 1 info.', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/input_descriptor_filter_examples.json',
    ).presentation_definition;
    pdSchema.input_descriptors[0].schema[0].uri = 'https://business-standards.org/schemas/employment-history.json';
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const vc0: IVerifiableCredential = vpSimple.verifiableCredential![0] as IVerifiableCredential;
    const wvc0: WrappedVerifiableCredential = {
      credential: vc0 as IVerifiableCredential,
      decoded: vc0,
      format: 'ldp',
      original: vc0,
      type: OriginalType.JSONLD,
    };
    const vc1: IVerifiableCredential = vpSimple.verifiableCredential![1] as IVerifiableCredential;
    const wvc1: WrappedVerifiableCredential = {
      credential: vc1 as IVerifiableCredential,
      decoded: vc1,
      format: 'ldp',
      original: vc1,
      type: OriginalType.JSONLD,
    };
    const vc2: IVerifiableCredential = vpSimple.verifiableCredential![2] as IVerifiableCredential;
    const wvc2: WrappedVerifiableCredential = {
      credential: vc2 as IVerifiableCredential,
      decoded: vc2,
      format: 'ldp',
      original: vc2,
      type: OriginalType.JSONLD,
    };
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pd, [wvc0, wvc1, wvc2]);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    const infoResults = evaluationClient.results.filter((result) => result.status === Status.INFO);
    expect(errorResults.length).toEqual(5);
    expect(infoResults.length).toEqual(1);
  });

  it('should generate 3 warn for Regular Hashlink (with URL encoded)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/input_descriptor_filter_examples.json',
    ).presentation_definition;
    pdSchema.input_descriptors[0].schema[0].uri = 'https://business-standards.org/schemas/employment-history.json';
    pdSchema.input_descriptors[0].schema.push({
      uri: 'hl:zm9YZpCjPLPJ4Epc:z3TSgXTuaHxY2tsArhUreJ4ixgw9NW7DYuQ9QTPQyLHy',
    });
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pd, wvcs);
    const warnResults = evaluationClient.results.filter((result) => result.status === Status.WARN);
    expect(warnResults.length).toEqual(3);
  });

  it('should generate 3 warn for Hashlink as a query parameter', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/input_descriptor_filter_examples.json',
    ).presentation_definition;
    pdSchema.input_descriptors[0].schema[0].uri = 'https://business-standards.org/schemas/employment-history.json';
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://example.com/hw.txt?hl=zm9YZpCjPLPJ4Epc' });
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler = new UriEvaluationHandler(evaluationClient);
    evaluationHandler.handle(pd, wvcs);
    const warnResults = evaluationClient.results.filter((result) => result.status === Status.WARN);
    expect(warnResults.length).toEqual(3);
  });
});
