import fs from 'fs';

import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential, VerifiablePresentation } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation/evaluationClient';
import { SubjectIsIssuerEvaluationHandler } from '../../lib/evaluation/handlers/subjectIsIssuerEvaluationHandler';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

  it('should return ok if subject_is_issuer is verified', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-subject-is-issuer.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-subject-is-issuer.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const subjectIsIssuerEvaluationHandler: SubjectIsIssuerEvaluationHandler = new SubjectIsIssuerEvaluationHandler(evaluationClient);
    const presentationSubmission: PresentationSubmission = {
      'id': '3cpLWMyiAT1qQXTaJNWOG',
      'definition_id': '31e2f0f1-6b70-411d-b239-56aed5321884',
      'descriptor_map': [
        {
          'id': '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          'format': 'ldp_vc',
          'path': '$.verifiableCredential[0]'
        }
      ]
    };
    const verifiableCredential: Array<VerifiableCredential> = [{
      'credentialSubject': {
        'id': 'did:example:123'
      },
      'id': '2dc74354-e965-4883-be5e-bfec48bf60c7',
      'type': ['VerifiableCredential'],
      '@context': [],
      'issuer': '',
      'issuanceDate': '',
      'proof': {proofPurpose: '', type: '', jws: '', created: '', verificationMethod: ''}
    }];
    verifiableCredential[0]['@context'] = [
      'https://www.w3.org/2018/credentials/v1'
    ];
    verifiableCredential[0]['age'] = 19;
    verifiableCredential[0]['issuer'] = 'did:example:123';
    verifiableCredential[0]['credentialSchema'] = [
      {
        'id': 'https://www.w3.org/TR/vc-data-model/#types'
      }
    ];
    subjectIsIssuerEvaluationHandler.presentationSubmission = presentationSubmission;
    subjectIsIssuerEvaluationHandler.verifiableCredential = verifiableCredential;

    subjectIsIssuerEvaluationHandler.handle(pdSchema, vpSimple.verifiableCredential);
    expect(subjectIsIssuerEvaluationHandler.getResults()[0]).toEqual({
      'input_descriptor_path': '$.input_descriptors[0]',
      'verifiable_credential_path': '$.verifiableCredential[0]',
      'evaluator': 'SubjectIsIssuerEvaluation',
      'status': 'info',
      'message': 'subject_is_issuer verified.'
    });
  });

  it('should return error if subject_is_issuer is not verified', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-subject-is-issuer.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-subject-is-issuer.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const subjectIsIssuerEvaluationHandler: SubjectIsIssuerEvaluationHandler = new SubjectIsIssuerEvaluationHandler(evaluationClient);
    const presentationSubmission: PresentationSubmission = {
      'id': '3cpLWMyiAT1qQXTaJNWOG',
      'definition_id': '31e2f0f1-6b70-411d-b239-56aed5321884',
      'descriptor_map': [
        {
          'id': '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
          'format': 'ldp_vc',
          'path': '$.verifiableCredential[0]'
        }
      ]
    };
    const verifiableCredentials: Array<VerifiableCredential> = [{
      'credentialSubject': {
        'id': 'did:example:123'
      },
      'id': '2dc74354-e965-4883-be5e-bfec48bf60c7',
      'type': ['VerifiableCredential'],
      '@context': [],
      'issuer': '',
      'issuanceDate': '',
      'proof': {proofPurpose: '', type: '', jws: '', created: '', verificationMethod: ''}
    }];
    verifiableCredentials[0]['@context'] = [
      'https://www.w3.org/2018/credentials/v1'
    ];
    verifiableCredentials[0]['age'] = 19;
    verifiableCredentials[0]['credentialSchema'] = [
      {
        'id': 'https://www.w3.org/TR/vc-data-model/#types'
      }
    ];
    verifiableCredentials[0]['issuer'] = 'did:example:124';
    subjectIsIssuerEvaluationHandler.presentationSubmission = presentationSubmission;
    subjectIsIssuerEvaluationHandler.verifiableCredential = verifiableCredentials;

    subjectIsIssuerEvaluationHandler.handle(pdSchema, vpSimple.verifiableCredential);
    expect(subjectIsIssuerEvaluationHandler.getResults()[0]).toEqual({
      'evaluator': 'SubjectIsIssuerEvaluation',
      'input_descriptor_path': '$.input_descriptors[0]',
      'message': 'couldn\'t verify subject is issuer.',
      'status': 'error',
      'verifiable_credential_path': '$.verifiableCredential[0]'
    });
  });
});