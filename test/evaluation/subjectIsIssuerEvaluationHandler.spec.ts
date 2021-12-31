import fs from 'fs';

import { EvaluationClient } from '../../lib/evaluation';
import { SubjectIsIssuerEvaluationHandler } from '../../lib/evaluation/handlers';
import {
  InternalPresentationDefinitionV1,
  InternalVerifiableCredential,
  InternalVerifiableCredentialJsonLD,
} from '../../lib/types/Internal.types';
import PEMessages from '../../lib/types/Messages';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {
  it('should return ok if subject_is_issuer is verified', function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-subject-is-issuer.json'
    ).presentation_definition;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const subjectIsIssuerEvaluationHandler: SubjectIsIssuerEvaluationHandler = new SubjectIsIssuerEvaluationHandler(
      evaluationClient
    );
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
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, {
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
    });

    subjectIsIssuerEvaluationHandler.handle(pdSchema, [vc]);
    expect(subjectIsIssuerEvaluationHandler.getResults()[0]).toEqual({
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'SubjectIsIssuerEvaluation',
      status: 'info',
      message: PEMessages.SUBJECT_IS_ISSUER,
    });
  });

  it('should return error if subject_is_issuer is not verified', function () {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-subject-is-issuer.json'
    ).presentation_definition;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const subjectIsIssuerEvaluationHandler: SubjectIsIssuerEvaluationHandler = new SubjectIsIssuerEvaluationHandler(
      evaluationClient
    );
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
    let vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
    vc = Object.assign(vc, {
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
    });

    subjectIsIssuerEvaluationHandler.handle(pdSchema, [vc]);
    expect(subjectIsIssuerEvaluationHandler.getResults()[0]).toEqual({
      evaluator: 'SubjectIsIssuerEvaluation',
      input_descriptor_path: '$.input_descriptors[0]',
      message: PEMessages.SUBJECT_IS_NOT_ISSUER,
      status: 'error',
      verifiable_credential_path: '$[0]',
    });
  });
});
