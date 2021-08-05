import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClient } from '../../lib/evaluation/evaluationClient';
import { SubjectIsIssuerEvaluationHandler } from '../../lib/evaluation/subjectIsIssuerEvaluationHandler';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

  it('should return ok if subject_is_issuer is verified', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-subject-is-issuer.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-simple-subject-is-issuer.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    // evaluationClient.evaluate(pdSchema, vpSimple);
    const subjectIsIssuerEvaluationHandler: SubjectIsIssuerEvaluationHandler = new SubjectIsIssuerEvaluationHandler(evaluationClient);
    subjectIsIssuerEvaluationHandler.verifiablePresentation.presentationSubmission = {
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
    subjectIsIssuerEvaluationHandler.verifiablePresentation.verifiableCredential = [{
      '@context': [
        'https://www.w3.org/2018/credentials/v1'
      ],
      'age': 19,
      'credentialSchema': [
        {
          'id': 'https://www.w3.org/TR/vc-data-model/#types'
        }
      ],
      'credentialSubject': {
        'id': 'did:example:123'
      },
      'id': '2dc74354-e965-4883-be5e-bfec48bf60c7',
      'issuer': 'did:example:123',
      'type': 'VerifiableCredential'
    }];
    subjectIsIssuerEvaluationHandler.handle(pdSchema, vpSimple);
    expect(subjectIsIssuerEvaluationHandler.getResults()[0]).toEqual({
      "input_descriptor_path": "$.input_descriptors[0]",
      "verifiable_credential_path": "$.verifiableCredential[0]",
      "evaluator": "SubjectIsIssuerEvaluation",
      "status": "info",
      "message": "subject_is_issuer verified."
    });
  });
});