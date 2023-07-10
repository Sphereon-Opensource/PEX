import fs from 'fs';

import { IVerifiableCredential, WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { EvaluationClient } from '../../lib/evaluation';
import { SubjectIsIssuerEvaluationHandler } from '../../lib/evaluation/handlers';
import { InternalPresentationDefinitionV1, SSITypesBuilder } from '../../lib/types';
import PexMessages from '../../lib/types/Messages';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {
  it('should return ok if subject_is_issuer is verified', function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-subject-is-issuer.json',
    ).presentation_definition;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const subjectIsIssuerEvaluationHandler: SubjectIsIssuerEvaluationHandler = new SubjectIsIssuerEvaluationHandler(evaluationClient);
    subjectIsIssuerEvaluationHandler.presentationSubmission = {
      id: '3cpLWMyiAT1qQXTaJNWOG',
      definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
      descriptor_map: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          format: 'ldp_vc',
          path: '$[0]',
        },
      ],
    };
    const vc: IVerifiableCredential = {
      credentialSubject: {
        id: 'did:example:123',
        age: 19,
      },
      id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
      type: ['VerifiableCredential'],
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      issuer: 'did:example:123',
      credentialSchema: [
        {
          id: 'https://www.w3.org/TR/vc-data-model/#types',
        },
      ],
      issuanceDate: '2021-04-12T23:20:50.52Z',
      proof: { proofPurpose: '', type: '', jws: '', created: '', verificationMethod: '' },
    };
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vc]);
    subjectIsIssuerEvaluationHandler.handle(pdSchema, wvcs);
    expect(subjectIsIssuerEvaluationHandler.getResults()[0]).toEqual({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'SubjectIsIssuerEvaluation',
      status: 'info',
      message: PexMessages.SUBJECT_IS_ISSUER,
      payload: {
        format: 'ldp_vc',
      },
    });
  });

  it('should return ok if subject_is_issuer is verified with multiple subjects', function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-subject-is-issuer.json',
    ).presentation_definition;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const subjectIsIssuerEvaluationHandler: SubjectIsIssuerEvaluationHandler = new SubjectIsIssuerEvaluationHandler(evaluationClient);
    subjectIsIssuerEvaluationHandler.presentationSubmission = {
      id: '3cpLWMyiAT1qQXTaJNWOG',
      definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
      descriptor_map: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          format: 'ldp_vc',
          path: '$[0]',
        },
      ],
    };
    const vc: IVerifiableCredential = {
      credentialSubject: [
        {
          id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
          name: 'Jayden Doe',
          spouse: 'did:example:c276e12ec21ebfeb1f712ebc6f1',
        },
        {
          id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
          name: 'Morgan Doe',
          spouse: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
        },
      ],
      id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
      type: ['VerifiableCredential'],
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      issuer: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
      credentialSchema: [
        {
          id: 'https://www.w3.org/TR/vc-data-model/#types',
        },
      ],
      issuanceDate: '2021-04-12T23:20:50.52Z',
      proof: { proofPurpose: '', type: '', jws: '', created: '', verificationMethod: '' },
    };
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vc]);
    subjectIsIssuerEvaluationHandler.handle(pdSchema, wvcs);
    expect(subjectIsIssuerEvaluationHandler.getResults()[0]).toEqual({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'SubjectIsIssuerEvaluation',
      status: 'info',
      message: PexMessages.SUBJECT_IS_ISSUER,
      payload: {
        format: 'ldp_vc',
      },
    });
  });

  it('should return error if subject_is_issuer is verified with multiple subjects one of which is not the issuer', function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-subject-is-issuer.json',
    ).presentation_definition;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const subjectIsIssuerEvaluationHandler: SubjectIsIssuerEvaluationHandler = new SubjectIsIssuerEvaluationHandler(evaluationClient);
    subjectIsIssuerEvaluationHandler.presentationSubmission = {
      id: '3cpLWMyiAT1qQXTaJNWOG',
      definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
      descriptor_map: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          format: 'ldp_vc',
          path: '$[0]',
        },
      ],
    };
    const vc: IVerifiableCredential = {
      credentialSubject: [
        {
          id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
          name: 'Jayden Doe',
          spouse: 'did:example:c276e12ec21ebfeb1f712ebc6f1',
        },
        {
          id: 'did:example:c276e12ec21ebfeb1f712ebc6f1',
          name: 'Morgan Doe, who is not the issuer',
          spouse: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
        },
      ],
      id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
      type: ['VerifiableCredential'],
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      issuer: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
      credentialSchema: [
        {
          id: 'https://www.w3.org/TR/vc-data-model/#types',
        },
      ],
      issuanceDate: '2021-04-12T23:20:50.52Z',
      proof: { proofPurpose: '', type: '', jws: '', created: '', verificationMethod: '' },
    };
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vc]);
    subjectIsIssuerEvaluationHandler.handle(pdSchema, wvcs);
    expect(subjectIsIssuerEvaluationHandler.getResults()[0]).toEqual({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'SubjectIsIssuerEvaluation',
      status: 'error',
      message: PexMessages.SUBJECT_IS_NOT_ISSUER,
      payload: {
        format: 'ldp_vc',
      },
    });
  });

  it('should return ok if subject_is_issuer is verified with multiple subjects and issuer object', function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-subject-is-issuer.json',
    ).presentation_definition;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const subjectIsIssuerEvaluationHandler: SubjectIsIssuerEvaluationHandler = new SubjectIsIssuerEvaluationHandler(evaluationClient);
    subjectIsIssuerEvaluationHandler.presentationSubmission = {
      id: '3cpLWMyiAT1qQXTaJNWOG',
      definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
      descriptor_map: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          format: 'ldp_vc',
          path: '$[0]',
        },
      ],
    };
    const vc: IVerifiableCredential = {
      credentialSubject: [
        {
          id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
          name: 'Jayden Doe',
          spouse: 'did:example:c276e12ec21ebfeb1f712ebc6f1',
        },
        {
          name: 'Morgan Doe',
          spouse: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
        },
      ],
      id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
      type: ['VerifiableCredential'],
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      issuer: {
        id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
      },
      credentialSchema: [
        {
          id: 'https://www.w3.org/TR/vc-data-model/#types',
        },
      ],
      issuanceDate: '2021-04-12T23:20:50.52Z',
      proof: { proofPurpose: '', type: '', jws: '', created: '', verificationMethod: '' },
    };
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vc]);
    subjectIsIssuerEvaluationHandler.handle(pdSchema, wvcs);
    expect(subjectIsIssuerEvaluationHandler.getResults()[0]).toEqual({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'SubjectIsIssuerEvaluation',
      status: 'info',
      message: PexMessages.SUBJECT_IS_ISSUER,
      payload: {
        format: 'ldp_vc',
      },
    });
  });

  it('should return error if subject_is_issuer is not verified', function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-subject-is-issuer.json',
    ).presentation_definition;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const subjectIsIssuerEvaluationHandler: SubjectIsIssuerEvaluationHandler = new SubjectIsIssuerEvaluationHandler(evaluationClient);
    subjectIsIssuerEvaluationHandler.presentationSubmission = {
      id: '3cpLWMyiAT1qQXTaJNWOG',
      definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
      descriptor_map: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          format: 'ldp_vc',
          path: '$[0]',
        },
      ],
    };
    const vc: IVerifiableCredential = {
      credentialSubject: {
        id: 'did:example:123',
        age: 19,
      },
      id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
      type: ['VerifiableCredential'],
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      issuer: 'did:example:124',
      credentialSchema: [
        {
          id: 'https://www.w3.org/TR/vc-data-model/#types',
        },
      ],
      issuanceDate: '2021-04-12T23:20:50.52Z',
      proof: { proofPurpose: '', type: '', jws: '', created: '', verificationMethod: '' },
    };
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vc]);
    subjectIsIssuerEvaluationHandler.handle(pdSchema, wvcs);
    expect(subjectIsIssuerEvaluationHandler.getResults()[0]).toEqual({
      evaluator: 'SubjectIsIssuerEvaluation',
      input_descriptor_path: '$.input_descriptors[0]',
      message: PexMessages.SUBJECT_IS_NOT_ISSUER,
      status: 'error',
      verifiable_credential_path: '$[0]',
      payload: {
        format: 'ldp_vc',
      },
    });
  });
});
