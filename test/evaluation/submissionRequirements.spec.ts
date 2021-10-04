import fs from 'fs';

import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { EvaluationClientWrapper, VP } from '../../lib';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';

describe('Submission requirements tests', () => {
  it('Evaluate submission requirements all from group A', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[0]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, vpSimple);
    expect(result).toEqual(expect.objectContaining({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        { 'format': 'ldp_vc', 'id': 'Educational transcripts', 'path': '$.verifiableCredential[0]' },
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 1', 'path': '$.verifiableCredential[1]' },
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 2', 'path': '$.verifiableCredential[2]' }
      ]
    }));
  });

  it('Evaluate submission requirements min 2 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[1]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    expect(evaluationClientWrapper.submissionFrom(pdSchema, vpSimple)).toEqual(expect.objectContaining({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 1', 'path': '$.verifiableCredential[1]' },
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 2', 'path': '$.verifiableCredential[2]' }
      ]
    }));
  });

  it('Evaluate submission requirements either all from group A or 2 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[2]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    expect(() => evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential)).toThrowError('Count: expected: 1 actual: 2 at level: 1');
  });

  it('Evaluate submission requirements max 2 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[3]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential);
    expect(result).toEqual(expect.objectContaining({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {"format": "ldp_vc", "id": "Educational transcripts 1", "path": "$.verifiableCredential[1]"},
        {"format": "ldp_vc", "id": "Educational transcripts 2", "path": "$.verifiableCredential[2]"}
      ]
    }));
  });

  it('Evaluate submission requirements min 3 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[4]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    expect(() => evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential)).toThrowError('Min: expected: 3 actual: 2 at level: 0');
  });

  it('Evaluate submission requirements max 1 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[5]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    expect(() => evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential)).toThrowError('Max: expected: 1 actual: 2 at level: 0');
  });

  it('Evaluate submission requirements exactly 1 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[6]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    expect(() => evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential)).toThrowError('Count: expected: 1 actual: 2 at level: 0');
  });

  it('Evaluate submission requirements all from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[7]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    expect(() => evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential)).toThrowError('Not all input descriptors are members of group B');
  });

  it('Evaluate submission requirements all from group A and 2 from group B', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[8]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential);
    expect(result).toEqual(expect.objectContaining({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        { 'format': 'ldp_vc', 'id': 'Educational transcripts', 'path': '$.verifiableCredential[0]' },
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 1', 'path': '$.verifiableCredential[1]' },
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 2', 'path': '$.verifiableCredential[2]' }
      ]
    }));
  });

  it('Evaluate submission requirements min 1: (all from group A or 2 from group B)', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[9]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential);
    expect(result).toEqual(expect.objectContaining({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        { 'format': 'ldp_vc', 'id': 'Educational transcripts', 'path': '$.verifiableCredential[0]' },
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 1', 'path': '$.verifiableCredential[1]' },
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 2', 'path': '$.verifiableCredential[2]' },
      ]
    }));
  });

  it('Evaluate submission requirements max 2: (all from group A and 2 from group B)', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[10]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential);
    expect(result).toEqual(expect.objectContaining({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        { 'format': 'ldp_vc', 'id': 'Educational transcripts', 'path': '$.verifiableCredential[0]' },
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 1', 'path': '$.verifiableCredential[1]' },
        { 'format': 'ldp_vc', 'id': 'Educational transcripts 2', 'path': '$.verifiableCredential[2]' }
      ]
    }));
  });

  it('Evaluate submission requirements min 3: (all from group A or 2 from group B + unexistent)', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema.submission_requirements = [pdSchema.submission_requirements[11]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    vpSimple.holder = HOLDER_DID;
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    expect(() => evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential)).toThrowError('Min: expected: 3 actual: 2 at level: 1');
  });

  it('Evaluate submission requirements max 1: (all from group A and 2 from group B)', () => {
    const pdSchema: PresentationDefinition = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    vpSimple.holder = HOLDER_DID;
    pdSchema.submission_requirements = [pdSchema.submission_requirements[12]];
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    evaluationClientWrapper.evaluate(pdSchema, new VP(vpSimple));
    expect(() => evaluationClientWrapper.submissionFrom(pdSchema, vpSimple.verifiableCredential)).toThrowError('Max: expected: 1 actual: 2 at level: 1');
  });
});
