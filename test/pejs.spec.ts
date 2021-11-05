import fs from 'fs';

import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { PEJS, Validated, VerifiablePresentation } from '../lib';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {
  it('testing constructor', function () {
    const pejs: PEJS = new PEJS();
    expect(pejs).toBeInstanceOf(PEJS);
  });

  it('Evaluate case with error result', () => {
    const pejs: PEJS = new PEJS();
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pdPermanentResidentCardExample.ts').presentation_definition;
    const vc = getFile('./test/dif_pe_examples/vc/vcPermanentResidentCardExample.ts');
    pdSchema.input_descriptors[0].schema = [{ uri: 'www.example.com/schema' }];
    const result = pejs.selectFrom(pdSchema, [vc], ['FAsYneKJhWBP2n5E21ZzdY']);
    expect(result!.errors!.length).toEqual(2);
    expect(result!.errors!.map((e) => e.tag)).toEqual(['UriEvaluation', 'MarkForSubmissionEvaluation']);
  });

  it('Evaluate case without any error', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pdSimpleSchemaAgePredicateExample.ts').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vpSimpleAgePredicateExample.ts');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/TR/vc-data-model/#types1' });
    const pejs: PEJS = new PEJS();
    const evaluationResults = pejs.evaluate(pdSchema, vpSimple);
    expect(evaluationResults!.value!.descriptor_map!.length).toEqual(1);
    expect(evaluationResults!.errors!.length).toEqual(0);
  });

  it('Evaluate submission requirements all from group A', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/srRules.ts').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vpGeneralExample.ts') as VerifiablePresentation;
    const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pejs: PEJS = new PEJS();
    vpSimple.holder = HOLDER_DID;
    pejs.evaluate(pdSchema, vpSimple);
    const result: PresentationSubmission = pejs.submissionFrom(pdSchema, vpSimple.verifiableCredential);
    expect(result).toEqual(
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

  it('Evaluate pd schema of our srRules.ts pd', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/srRules.ts').presentation_definition;
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pejs: PEJS = new PEJS();
    const result: Validated = pejs.validateDefinition(pdSchema);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate presentation submission of our vp_general\'s presentation_submission', () => {
    const vpSimple = getFile('./test/dif_pe_examples/vp/vpGeneralExample.ts');
    const pejs: PEJS = new PEJS();
    const result: Validated = pejs.validateSubmission(vpSimple.presentation_submission);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('Evaluate pd schema of our pdDriverLicenseNameExample.ts pd', () => {
    const pdSchema = getFile('./test/dif_pe_examples/pd/pdDriverLicenseNameExample.ts');
    const pejs: PEJS = new PEJS();
    const result: Validated = pejs.validateDefinition(pdSchema.presentation_definition);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });
});
