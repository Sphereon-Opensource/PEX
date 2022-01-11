import fs from 'fs';

import { PresentationDefinitionV1 } from '@sphereon/pex-models';

import { IPresentation, IVerifiablePresentation, PEXv1, ProofType, Validated } from '../lib';

import {
  assertedMockCallback,
  assertedMockCallbackWithoutProofType,
  getErrorThrown,
  getProofOptionsMock,
  getSingatureOptionsMock,
} from './test_data/PresentationSignUtilMock';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = [ProofType.BbsBlsSignatureProof2020];

describe('evaluate', () => {
  it('testing constructor', function () {
    const pex: PEXv1 = new PEXv1();
    expect(pex).toBeInstanceOf(PEXv1);
  });

  it('Evaluate case with error result', () => {
    const pex: PEXv1 = new PEXv1();
    const pdSchema: PresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-PermanentResidentCard.json'
    ).presentation_definition;
    const vc = getFile('./test/dif_pe_examples/vc/vc-PermanentResidentCard.json');
    pdSchema.input_descriptors[0].schema = [{ uri: 'https://www.example.com/schema' }];
    const result = pex.selectFrom(pdSchema, [vc], ['FAsYneKJhWBP2n5E21ZzdY'], LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(result!.errors!.length).toEqual(2);
    expect(result!.errors!.map((e) => e.tag)).toEqual(['UriEvaluation', 'MarkForSubmissionEvaluation']);
  });

  it('Evaluate case without any error 1', () => {
    const pdSchema: PresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const pex: PEXv1 = new PEXv1();
    const evaluationResults = pex.evaluatePresentation(pdSchema, vpSimple, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(evaluationResults!.value!.descriptor_map!.length).toEqual(1);
    expect(evaluationResults!.errors!.length).toEqual(0);
  });

  it('Evaluate case without any error 2', () => {
    const pdSchema: PresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const pex: PEXv1 = new PEXv1();
    const evaluationResults = pex.evaluateCredentials(
      pdSchema,
      vpSimple.verifiableCredential,
      [vpSimple.holder as string],
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    expect(evaluationResults!.value!.descriptor_map!.length).toEqual(1);
    expect(evaluationResults!.errors!.length).toEqual(0);
  });

  it('Evaluate submission requirements all from group A', () => {
    const pdSchema: PresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pex: PEXv1 = new PEXv1();
    pex.evaluateCredentials(pdSchema, vpSimple.verifiableCredential, [HOLDER_DID], LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    const presentation: IPresentation = pex.presentationFrom(pdSchema, vpSimple.verifiableCredential, HOLDER_DID);
    expect(presentation.presentation_submission).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'ldp_vc', id: 'Educational transcripts', path: '$.verifiableCredential[0]' },
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[1]' },
          { format: 'ldp_vc', id: 'Educational transcripts 2', path: '$.verifiableCredential[2]' },
        ],
      })
    );
    expect(presentation.holder).toEqual(HOLDER_DID);
    expect(presentation.verifiableCredential).toEqual(vpSimple.verifiableCredential);
    expect(presentation.type).toEqual(['VerifiablePresentation', 'PresentationSubmission']);
    expect(presentation['@context']).toEqual([
      'https://www.w3.org/2018/credentials/v1',
      'https://identity.foundation/presentation-exchange/submission/v1',
    ]);
  });

  it('Evaluate pdV1 schema of our sr_rules.json pdV1', () => {
    const pdSchema: PresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pex: PEXv1 = new PEXv1();
    const result: Validated = pex.validateDefinition(pdSchema);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it("Evaluate presentation submission of our vp_general's presentation_submission", () => {
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const pex: PEXv1 = new PEXv1();
    const result: Validated = pex.validateSubmission(vpSimple.presentation_submission);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate pdV1 schema of our pd_driver_license_name.json pdV1', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const pex: PEXv1 = new PEXv1();
    const result: Validated = pex.validateDefinition(pdSchema.presentation_definition);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('should return a signed presentation', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json') as IVerifiablePresentation;
    const pex: PEXv1 = new PEXv1();
    const vp: IVerifiablePresentation = pex.verifiablePresentationFrom(
      pdSchema.presentation_definition,
      vpSimple.verifiableCredential,
      assertedMockCallback,
      {
        proofOptions: getProofOptionsMock(),
        signatureOptions: getSingatureOptionsMock(),
        holder: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
      }
    );
    const proof = Array.isArray(vp.proof) ? vp.proof[0] : vp.proof;
    expect(proof.created).toEqual('2021-12-01T20:10:45.000Z');
    expect(proof.proofValue).toEqual('fake');
    expect(proof.verificationMethod).toEqual('did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489#key');
  });

  it("should throw error if proofOptions doesn't have a type", () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const pejs: PEXv1 = new PEXv1();
    delete pdSchema.presentation_definition.input_descriptors[0].schema;
    const proofOptions = getProofOptionsMock();
    delete proofOptions['type'];
    proofOptions.typeSupportsSelectiveDisclosure = true;
    expect(() =>
      pejs.verifiablePresentationFrom(
        pdSchema.presentation_definition,
        vpSimple.verifiableCredential,
        assertedMockCallbackWithoutProofType,
        {
          proofOptions,
          signatureOptions: getSingatureOptionsMock(),
          holder: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
        }
      )
    ).toThrowError('Please provide a proof type if you enable selective disclosure');
  });

  it('should throw exception if signing encounters a problem', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pdV1/pd_driver_license_name.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as IVerifiablePresentation;
    const pex: PEXv1 = new PEXv1();

    expect(() => {
      pex.verifiablePresentationFrom(pdSchema.presentation_definition, vpSimple.verifiableCredential, getErrorThrown, {
        proofOptions: getProofOptionsMock(),
        signatureOptions: getSingatureOptionsMock(),
      });
    }).toThrow(Error);
  });
});
