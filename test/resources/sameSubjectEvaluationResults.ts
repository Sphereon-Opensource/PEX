import { HandlerCheckResult } from '../../lib';

export class SameSubjectEvaluationResults {
  public getSameSubjectEvaluationResults(): HandlerCheckResult[] {
    return [
      {
        evaluator: 'SameSubjectEvaluation',
        input_descriptor_path: '$.input_descriptors[0]',
        message: 'The field ids requiring the same subject to belong to same subject',
        payload: {
          credentialSubject: {
            id: 'VCSubject2020081200',
            field1Key: 'field1Value',
          },
          fieldIdSet: ['field1Key', 'field2Key'],
        },
        status: 'info',
        verifiable_credential_path: '$[0]',
      },
      {
        evaluator: 'SameSubjectEvaluation',
        input_descriptor_path: '$.input_descriptors[1]',
        message: 'The field ids requiring the same subject to belong to same subject',
        payload: {
          credentialSubject: {
            id: 'VCSubject2020081200',
            field2Key: 'field2Value',
          },
          fieldIdSet: ['field1Key', 'field2Key'],
        },
        status: 'info',
        verifiable_credential_path: '$[1]',
      },
      {
        evaluator: 'SameSubjectEvaluation',
        input_descriptor_path: '$.input_descriptors[2]',
        message: 'The field ids preferring the same subject to belong to same subject',
        payload: {
          credentialSubject: {
            id: 'VCSubject2020081205',
            field3Key: 'field3Value',
          },
          fieldIdSet: ['field3Key', 'field4Key'],
        },
        status: 'warn',
        verifiable_credential_path: '$[2]',
      },
      {
        evaluator: 'SameSubjectEvaluation',
        input_descriptor_path: '$.input_descriptors[3]',
        message: 'The field ids preferring the same subject to belong to same subject',
        payload: {
          credentialSubject: {
            id: 'VCSubject2020081205',
            field4Key: 'field4Value',
          },
          fieldIdSet: ['field3Key', 'field4Key'],
        },
        status: 'warn',
        verifiable_credential_path: '$[3]',
      },
    ];
  }
}
