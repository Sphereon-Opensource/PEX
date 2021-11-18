import { HandlerCheckResult } from '../../../lib';

export class LimitDisclosureEvaluationResults {
  getMultiCredentialResults(): HandlerCheckResult[] {
    return [
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[0]',
        message: 'added variable in the limit_disclosure to the verifiableCredential',
        payload: undefined,
        status: 'info',
        verifiable_credential_path: '$[0]',
      },
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[1]',
        message: 'added variable in the limit_disclosure to the verifiableCredential',
        payload: undefined,
        status: 'info',
        verifiable_credential_path: '$[1]',
      },
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[2]',
        message: 'added variable in the limit_disclosure to the verifiableCredential',
        payload: undefined,
        status: 'info',
        verifiable_credential_path: '$[2]',
      },
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[3]',
        message: 'added variable in the limit_disclosure to the verifiableCredential',
        payload: undefined,
        status: 'info',
        verifiable_credential_path: '$[3]',
      },
    ];
  }
}
