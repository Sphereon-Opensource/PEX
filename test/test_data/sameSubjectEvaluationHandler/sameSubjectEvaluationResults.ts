import { HandlerCheckResult } from '../../../lib';

export class SameSubjectHandlerCheckResults {
  public getSameSubjectHandlerCheckResult(): HandlerCheckResult[] {
    return [
      {
        input_descriptor_path: '$.input_descriptors[0]',
        verifiable_credential_path: '$[0]',
        evaluator: 'SameSubjectEvaluation',
        status: 'info',
        payload: {
          fieldIdSet: ['field1Key', 'field2Key'],
          credentialSubject: {
            id: 'VCSubject2020081200',
            field1Key: 'field1Value',
          },
        },
        message: 'The field ids requiring the same subject to belong to same subject',
      },
      {
        input_descriptor_path: '$.input_descriptors[1]',
        verifiable_credential_path: '$[1]',
        evaluator: 'SameSubjectEvaluation',
        status: 'info',
        payload: {
          fieldIdSet: ['field1Key', 'field2Key'],
          credentialSubject: {
            id: 'VCSubject2020081200',
            field2Key: 'field2Value',
          },
        },
        message: 'The field ids requiring the same subject to belong to same subject',
      },
      {
        input_descriptor_path: '$.input_descriptors[2]',
        verifiable_credential_path: '$[2]',
        evaluator: 'SameSubjectEvaluation',
        status: 'warn',
        payload: {
          fieldIdSet: ['field3Key', 'field4Key'],
          credentialSubject: {
            id: 'VCSubject2020081205',
            field3Key: 'field3Value',
          },
        },
        message: 'The field ids preferring the same subject to belong to same subject',
      },
      {
        input_descriptor_path: '$.input_descriptors[3]',
        verifiable_credential_path: '$[3]',
        evaluator: 'SameSubjectEvaluation',
        status: 'warn',
        payload: {
          fieldIdSet: ['field3Key', 'field4Key'],
          credentialSubject: {
            id: 'VCSubject2020081205',
            field4Key: 'field4Value',
          },
        },
        message: 'The field ids preferring the same subject to belong to same subject',
      },

      {
        input_descriptor_path: '$.input_descriptors[4]',
        verifiable_credential_path: '$[4]',
        evaluator: 'SameSubjectEvaluation',
        status: 'info',
        payload: {
          fieldIdSet: ['field5Key', 'field6Key'],
          credentialSubject: {
            id: 'VCSubject2021110800',
            field5Key: 'field5Value',
          },
        },
        message: 'The field ids requiring the same subject to belong to same subject',
      },
      {
        input_descriptor_path: '$.input_descriptors[5]',
        verifiable_credential_path: '$[5]',
        evaluator: 'SameSubjectEvaluation',
        status: 'info',
        payload: {
          fieldIdSet: ['field5Key', 'field6Key'],
          credentialSubject: {
            id: 'VCSubject2021110800',
            field6Key: 'field6Value',
          },
        },
        message: 'The field ids requiring the same subject to belong to same subject',
      },
      {
        input_descriptor_path: '$.input_descriptors[6]',
        verifiable_credential_path: '$[6]',
        evaluator: 'SameSubjectEvaluation',
        status: 'error',
        payload: {
          fieldIdSet: ['field7Key', 'field8Key'],
          credentialSubject: {
            id: 'VCSubject2021110801',
            field7Key: 'field7Value',
          },
        },
        message: 'The fields ids not belong to the same subject',
      },
      {
        input_descriptor_path: '$.input_descriptors[7]',
        verifiable_credential_path: '$[7]',
        evaluator: 'SameSubjectEvaluation',
        status: 'error',
        payload: {
          fieldIdSet: ['field7Key', 'field8Key'],
          credentialSubject: {
            id: 'VCSubject2021110802',
            field8Key: 'field8Value',
          },
        },
        message: 'The fields ids not belong to the same subject',
      },
      {
        input_descriptor_path: '$.input_descriptors[10]',
        verifiable_credential_path: '$[8]',
        evaluator: 'SameSubjectEvaluation',
        status: 'error',
        payload: {
          fieldIdSet: ['field11Key', 'field12Key'],
          credentialSubject: {
            id: 'VCSubject2021110803',
            field11Key: 'field11Value',
          },
        },
        message: 'The fields ids not belong to the same subject',
      },
      {
        input_descriptor_path: '$.input_descriptors[11]',
        verifiable_credential_path: '$[9]',
        evaluator: 'SameSubjectEvaluation',
        status: 'error',
        payload: {
          fieldIdSet: ['field11Key', 'field12Key'],
          credentialSubject: {
            id: 'VCSubject2021110804',
            field12Key: 'field12Value',
          },
        },
        message: 'The fields ids not belong to the same subject',
      },
    ];
  }
}
