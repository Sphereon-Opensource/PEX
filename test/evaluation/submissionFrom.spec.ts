import fs from 'fs';

import { PresentationSubmission } from '@sphereon/pex-models';
import { IVerifiablePresentation, WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { IPresentationDefinition, PEX } from '../../lib';
import { EvaluationClientWrapper } from '../../lib/evaluation';
import { InternalPresentationDefinitionV1 } from '../../lib/types/Internal.types';
import { SSITypesBuilder } from '../../lib/types/SSITypesBuilder';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const HOLDER_DID = ['did:example:ebfeb1f712ebc6f1c276e12ec21'];

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = ['BbsBlsSignatureProof2020'];

describe('Submission requirements tests', () => {
  it('Evaluate submission requirements all from group A', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!),
    );
    expect(result).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'jwt_vc', id: 'Educational transcripts', path: '$.verifiableCredential[0]' },
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[1]' },
          { format: 'ldp_vc', id: 'Educational transcripts 2', path: '$.verifiableCredential[2]' },
        ],
      }),
    );
  });

  it('Evaluate submission requirements min 2 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![1]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!),
    );
    expect(result).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[1]' },
          { format: 'ldp_vc', id: 'Educational transcripts 2', path: '$.verifiableCredential[2]' },
        ],
      }),
    );
  });

  it('Evaluate submission requirements either all from group A or 2 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![2]];
    pdSchema.input_descriptors = [pdSchema.input_descriptors[0], pdSchema.input_descriptors[1]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!),
    );
    expect(result).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'jwt_vc', id: 'Educational transcripts', path: '$.verifiableCredential[0]' },
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[1]' },
        ],
      }),
    );
  });

  it('Evaluate submission requirements max 2 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![3]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!),
    );
    expect(result).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[1]' },
          { format: 'ldp_vc', id: 'Educational transcripts 2', path: '$.verifiableCredential[2]' },
        ],
      }),
    );
  });

  it('Evaluate submission requirements min 3 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![4]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(() =>
      evaluationClientWrapper.submissionFrom(pdSchema, SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!)),
    ).toThrowError('Min: expected: 3 actual: 2 at level: 0');
  });

  it('Evaluate submission requirements max 1 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![5]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(() =>
      evaluationClientWrapper.submissionFrom(pdSchema, SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!)),
    ).toThrowError('Max: expected: 1 actual: 2 at level: 0');
  });

  it('Evaluate submission requirements exactly 1 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![6]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(() =>
      evaluationClientWrapper.submissionFrom(pdSchema, SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!)),
    ).toThrowError('Count: expected: 1 actual: 2 at level: 0');
  });

  it('Evaluate submission requirements all from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![7]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(
      evaluationClientWrapper.submissionFrom(pdSchema, SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!)),
    ).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          {
            format: 'ldp_vc',
            id: 'Educational transcripts 1',
            path: '$.verifiableCredential[1]',
          },
          {
            format: 'ldp_vc',
            id: 'Educational transcripts 2',
            path: '$.verifiableCredential[2]',
          },
        ],
      }),
    );
  });

  it('Evaluate submission requirements all from group A and 2 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![8]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!),
    );
    expect(result).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'jwt_vc', id: 'Educational transcripts', path: '$.verifiableCredential[0]' },
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[1]' },
          { format: 'ldp_vc', id: 'Educational transcripts 2', path: '$.verifiableCredential[2]' },
        ],
      }),
    );
  });

  it('Evaluate submission requirements min 1: (all from group A or 2 from group B)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![9]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!),
    );
    expect(result).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'jwt_vc', id: 'Educational transcripts', path: '$.verifiableCredential[0]' },
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[1]' },
          { format: 'ldp_vc', id: 'Educational transcripts 2', path: '$.verifiableCredential[2]' },
        ],
      }),
    );
  });

  it('Evaluate submission requirements max 2: (all from group A and 2 from group B)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![10]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    const result: PresentationSubmission = evaluationClientWrapper.submissionFrom(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!),
    );
    expect(result).toEqual(
      expect.objectContaining({
        definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
        descriptor_map: [
          { format: 'jwt_vc', id: 'Educational transcripts', path: '$.verifiableCredential[0]' },
          { format: 'ldp_vc', id: 'Educational transcripts 1', path: '$.verifiableCredential[1]' },
          { format: 'ldp_vc', id: 'Educational transcripts 2', path: '$.verifiableCredential[2]' },
        ],
      }),
    );
  });

  it('Evaluate submission requirements min 3: (all from group A or 2 from group B + unexistent)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![11]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(() =>
      evaluationClientWrapper.submissionFrom(pdSchema, SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!)),
    ).toThrowError('Min: expected: 3 actual: 2 at level: 1');
  });

  it('Evaluate submission requirements max 1: (all from group A and 2 from group B)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![12]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential![0],
      vpSimple.verifiableCredential![1],
      vpSimple.verifiableCredential![2],
    ]);
    evaluationClientWrapper.evaluate(pd, wvcs, {
      holderDIDs: HOLDER_DID,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(() =>
      evaluationClientWrapper.submissionFrom(pdSchema, SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(vpSimple.verifiableCredential!)),
    ).toThrowError('Max: expected: 1 actual: 2 at level: 1');
  });

  it.skip('PD name', () => {
    const pd2: IPresentationDefinition = {
      id: 'PD_JobApplication_123456',
      submission_requirements: [
        {
          name: 'Employment and Academic/Certification Requirement',
          purpose: "Verify the applicant's employment history, and at least one of academic qualification or professional certification",
          rule: 'pick',
          min: 2,
          from_nested: [
            { rule: 'all', from: 'employmentGroup' },
            { rule: 'pick', min: 1, from: 'academicGroup' },
          ],
        },
      ],
      input_descriptors: [
        {
          id: 'employmentHistoryVerification',
          name: 'Employment History',
          purpose: "Verify the applicant's previous employment experiences",
          group: ['employmentGroup'],
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.employmentHistory'],
                filter: {
                  type: 'array',
                },
              },
            ],
          },
        },
        {
          id: 'degreeVerification',
          name: 'Degree',
          purpose: "Confirm the applicant's academic qualification",
          group: ['academicGroup'],
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.degree'],
                filter: {
                  type: 'string',
                  pattern: '(Engineering|Computer|Cyber|Security)',
                },
              },
            ],
          },
        },
        {
          id: 'CEH_CertificationVerification',
          name: 'Certified Ethical Hacker Certification',
          purpose: 'Confirm the applicant holds a Certified Ethical Hacker certification',
          group: ['academicGroup'],
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.certifications[*].name'],
                filter: {
                  type: 'string',
                  pattern: 'Certified Ethical Hacker',
                },
              },
              {
                path: ['$.credentialSubject.certifications[*].issuer'],
                filter: {
                  type: 'string',
                  pattern: 'did:example:123456789abcdefghi',
                },
              },
            ],
          },
        },
      ],
    };
    console.log(`${pd2.id}`);

    const pd = getFile('./test/resources/pd_long_names_invalid.json');

    const results = PEX.validateDefinition(pd);
    console.log(JSON.stringify(results, null, 2));
  });
});
