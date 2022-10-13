import { HandlerCheckResult } from '../../../lib';
import PexMessages from '../../../lib/types/Messages';

export class LimitDisclosureEvaluationResults {
  getMultiCredentialResultsAllInfo(): HandlerCheckResult[] {
    return [
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[0]',
        message: PexMessages.LIMIT_DISCLOSURE_APPLIED,
        payload: undefined,
        status: 'info',
        verifiable_credential_path: '$[0]',
      },
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[1]',
        message: PexMessages.LIMIT_DISCLOSURE_APPLIED,
        payload: undefined,
        status: 'info',
        verifiable_credential_path: '$[1]',
      },
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[2]',
        message: PexMessages.LIMIT_DISCLOSURE_APPLIED,
        payload: undefined,
        status: 'info',
        verifiable_credential_path: '$[2]',
      },
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[3]',
        message: PexMessages.LIMIT_DISCLOSURE_APPLIED,
        payload: undefined,
        status: 'info',
        verifiable_credential_path: '$[3]',
      },
    ];
  }

  getMultiCredentialResultsThreeInfos(): HandlerCheckResult[] {
    return [
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[0]',
        message: PexMessages.LIMIT_DISCLOSURE_APPLIED,
        payload: undefined,
        status: 'info',
        verifiable_credential_path: '$[0]',
      },
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[1]',
        message: PexMessages.LIMIT_DISCLOSURE_APPLIED,
        payload: undefined,
        status: 'info',
        verifiable_credential_path: '$[1]',
      },
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[2]',
        message: PexMessages.LIMIT_DISCLOSURE_APPLIED,
        payload: undefined,
        status: 'info',
        verifiable_credential_path: '$[2]',
      },
    ];
  }

  getMultiCredentialResultsOneError(): HandlerCheckResult[] {
    return [
      {
        evaluator: 'LimitDisclosureEvaluation',
        input_descriptor_path: '$.input_descriptors[3]',
        message: PexMessages.LIMIT_DISCLOSURE_NOT_SUPPORTED,
        payload: undefined,
        status: 'error',
        verifiable_credential_path: '$[3]',
      },
    ];
  }
}
