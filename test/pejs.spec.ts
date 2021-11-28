import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { PEJS, Presentation, Validated, VerifiablePresentation } from '../lib';
import { ProofType } from '../lib/verifiablePresentation/SSI.types';

import {
  assertedMockCallback,
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
    const pejs: PEJS = new PEJS();
    expect(pejs).toBeInstanceOf(PEJS);
  });

  it('Evaluate case with error result', () => {
    const pejs: PEJS = new PEJS();
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-PermanentResidentCard.json'
    ).presentation_definition;
    const vc = getFile('./test/dif_pe_examples/vc/vc-PermanentResidentCard.json');
    pdSchema.input_descriptors[0].schema = [{ uri: 'www.example.com/schema' }];
    const result = pejs.selectFrom(pdSchema, [vc], ['FAsYneKJhWBP2n5E21ZzdY'], LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(result!.errors!.length).toEqual(2);
    expect(result!.errors!.map((e) => e.tag)).toEqual(['UriEvaluation', 'MarkForSubmissionEvaluation']);
  });

  it('Evaluate case without any error', () => {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const pejs: PEJS = new PEJS();
    const evaluationResults = pejs.evaluatePresentation(pdSchema, vpSimple, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(evaluationResults!.value!.descriptor_map!.length).toEqual(1);
    expect(evaluationResults!.errors!.length).toEqual(0);
  });

  it('Evaluate submission requirements all from group A', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as VerifiablePresentation;
    const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pejs: PEJS = new PEJS();
    vpSimple.holder = HOLDER_DID;
    pejs.evaluatePresentation(pdSchema, vpSimple, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    const presentation: Presentation = pejs.presentationFrom(pdSchema, vpSimple.verifiableCredential, vpSimple.holder);
    expect(presentation.presentation_submission).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'ldp_vc', id: 'Educational transcripts', path: '$[0]' },
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$[1]' },
          { format: 'ldp_vc', id: 'Educational transcripts 2', path: '$[2]' },
        ],
      })
    );
  });

  it('Evaluate case without any error', () => {
    const pdSchema: PresentationDefinition = getFile(
      './test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json'
    ).presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const pejs: PEJS = new PEJS();
    const evaluationResults = pejs.evaluateCredentials(
      pdSchema,
      vpSimple.verifiableCredential,
      [vpSimple.holder as string],
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    expect(evaluationResults!.value!.descriptor_map!.length).toEqual(1);
    expect(evaluationResults!.errors!.length).toEqual(0);
  });

  it('Evaluate submission requirements all from group A', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as VerifiablePresentation;
    const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pejs: PEJS = new PEJS();
    pejs.evaluateCredentials(pdSchema, vpSimple.verifiableCredential, [HOLDER_DID], LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    const presentation: Presentation = pejs.presentationFrom(pdSchema, vpSimple.verifiableCredential, HOLDER_DID);
    expect(presentation.presentation_submission).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'ldp_vc', id: 'Educational transcripts', path: '$[0]' },
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$[1]' },
          { format: 'ldp_vc', id: 'Educational transcripts 2', path: '$[2]' },
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

  it('Evaluate pd schema of our sr_rules.json pd', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pejs: PEJS = new PEJS();
    const result: Validated = pejs.validateDefinition(pdSchema);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it("Evaluate presentation submission of our vp_general's presentation_submission", () => {
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const pejs: PEJS = new PEJS();
    const result: Validated = pejs.validateSubmission(vpSimple.presentation_submission);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate pd schema of our pd_driver_license_name.json pd', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pd/pd_driver_license_name.json');
    const pejs: PEJS = new PEJS();
    const result: Validated = pejs.validateDefinition(pdSchema.presentation_definition);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('should return a signed presentation', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pd/pd_driver_license_name.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as VerifiablePresentation;
    const pejs: PEJS = new PEJS();
    const vp: VerifiablePresentation = pejs.verifiablePresentationFrom(
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

  it('should throw exception if signing encounters a problem', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pd/pd_driver_license_name.json');
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json') as VerifiablePresentation;
    const pejs: PEJS = new PEJS();

    expect(() => {
      pejs.verifiablePresentationFrom(pdSchema.presentation_definition, vpSimple.verifiableCredential, getErrorThrown, {
        proofOptions: getProofOptionsMock(),
        signatureOptions: getSingatureOptionsMock(),
      });
    }).toThrow(Error);
  });
});
