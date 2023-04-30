import { PresentationSubmission, Rules } from '@sphereon/pex-models';
import { IVerifiableCredential } from '@sphereon/ssi-types';

import { HandlerCheckResult, SelectResults, Status } from '../../lib';
import PexMessages from '../../lib/types/Messages';

export class EvaluationClientWrapperData {
  public getHolderDID(): string[] {
    return ['did:example:ebfeb1f712ebc6f1c276e12ec21'];
  }

  public getInputDescriptorsDoesNotMatchResult0(): HandlerCheckResult {
    return {
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'error',
      message: PexMessages.URI_EVALUATION_DIDNT_PASS,
      payload: {
        format: 'ldp_vc',
        inputDescriptorsUris: ['https://www.w3.org/TR/vc-data-model/#types1'],
        vcContext: ['https://www.w3.org/2018/credentials/v1'],
        vcCredentialSchema: [{ id: 'https://www.w3.org/TR/vc-data-model/#types' }],
      },
    };
  }

  public getInputDescriptorsDoesNotMatchResult3(): HandlerCheckResult {
    return {
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'MarkForSubmissionEvaluation',
      status: 'error',
      message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
      payload: {
        evaluator: 'UriEvaluation',
        format: 'ldp_vc',
        inputDescriptorsUris: ['https://www.w3.org/TR/vc-data-model/#types1'],
        vcContext: ['https://www.w3.org/2018/credentials/v1'],
        vcCredentialSchema: [{ id: 'https://www.w3.org/TR/vc-data-model/#types' }],
      },
    };
  }

  public getUriInVerifiableCredentialDoesNotMatchResult0(): HandlerCheckResult {
    return {
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'error',
      message: PexMessages.URI_EVALUATION_DIDNT_PASS,
      payload: {
        format: 'ldp_vc',
        inputDescriptorsUris: ['https://www.w3.org/2018/credentials/v1'],
        vcContext: ['https://www.w3.org/TR/vc-data-model/#types1'],
        vcCredentialSchema: [{ id: 'https://www.w3.org/TR/vc-data-model/#types' }],
      },
    };
  }

  public getUriInVerifiableCredentialDoesNotMatchResult3(): HandlerCheckResult {
    return {
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'MarkForSubmissionEvaluation',
      status: 'error',
      message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
      payload: {
        evaluator: 'UriEvaluation',
        format: 'ldp_vc',
        inputDescriptorsUris: ['https://www.w3.org/2018/credentials/v1'],
        vcContext: ['https://www.w3.org/TR/vc-data-model/#types1'],
        vcCredentialSchema: [{ id: 'https://www.w3.org/TR/vc-data-model/#types' }],
      },
    };
  }

  public getForSubmissionRequirementsAllRuleResult0(): PresentationSubmission {
    return {
      id: 'PresentationSubmission2021110401',
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {
          id: 'Educational transcripts',
          format: 'jwt_vc', // This is actually a decoded JWT VC it seems
          path: '$.verifiableCredential[0]',
        },
      ],
    };
  }

  public getgetForSubmissionRequirementsPickRuleResult0(): PresentationSubmission {
    return {
      id: 'PresentationSubmission2021110402',
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {
          format: 'ldp_vc',
          id: 'Educational transcripts 1',
          path: '$[0]',
        },
        {
          format: 'ldp_vc',
          id: 'Educational transcripts 2',
          path: '$[1]',
        },
      ],
    };
  }

  public getSuccess() {
    return {
      errors: [],
      value: expect.objectContaining({
        definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
        descriptor_map: [
          {
            format: 'ldp_vc',
            id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
            path: '$.verifiableCredential[0]',
          },
        ],
      }),
      warnings: [],
    };
  }

  public getWarn() {
    return {
      errors: [],
      value: expect.objectContaining({
        definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
        descriptor_map: [
          {
            format: 'ldp_vc',
            id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
            path: '$.verifiableCredential[0]',
          },
        ],
      }),
      warnings: [
        {
          message: PexMessages.LIMIT_DISCLOSURE_APPLIED + ': $.input_descriptors[0]: $.verifiableCredential[0]',
          status: 'warn',
          tag: 'LimitDisclosureEvaluation',
        },
      ],
    };
  }

  public getError() {
    return {
      errors: [
        {
          message: PexMessages.URI_EVALUATION_DIDNT_PASS + ': $.input_descriptors[0]: $.verifiableCredential[0]',
          status: 'error',
          tag: 'UriEvaluation',
        },
        {
          message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION + ': $.input_descriptors[0]: $.verifiableCredential[0]',
          status: 'error',
          tag: 'MarkForSubmissionEvaluation',
        },
      ],
      warnings: [],
    };
  }

  public getSelectResults(): SelectResults {
    return {
      areRequiredCredentialsPresent: Status.INFO,
      verifiableCredential: [
        {
          id: 'CredentialID2021110405',
          credentialStatus: {
            id: '',
            type: '',
          },
          credentialSubject: {},
          expirationDate: '',
          issuanceDate: '',
          issuer: '',
          type: [],
          '@context': [],
          proof: {
            type: '',
            created: '',
            proofPurpose: '',
            verificationMethod: '',
            jws: '',
          },
        } as IVerifiableCredential,
      ],
      vcIndexes: [],
      matches: [
        {
          name: 'test',
          rule: Rules.All,
          vc_path: ['$.verifiableCredential[0]'],
        },
      ],
    };
  }

  public getVerifiableCredential(): IVerifiableCredential[] {
    return [
      {
        id: 'CredentialID2021110100',
        credentialStatus: {
          id: '',
          type: '',
        },
        credentialSubject: {},
        expirationDate: '',
        issuanceDate: '',
        issuer: '',
        type: [],

        '@context': [],
        proof: {
          type: '',
          created: '',
          proofPurpose: '',
          verificationMethod: '',
          jws: '',
        },
      } as IVerifiableCredential,
      {
        id: 'CredentialID2021110405',
        credentialStatus: {
          id: '',
          type: '',
        },
        credentialSubject: {},
        expirationDate: '',
        issuanceDate: '',
        issuer: '',
        type: [],

        '@context': [],
        proof: {
          type: '',
          created: '',
          proofPurpose: '',
          verificationMethod: '',
          jws: '',
        },
      } as IVerifiableCredential,
      {
        id: 'CredentialID2021110406',
        credentialStatus: {
          id: '',
          type: '',
        },
        credentialSubject: {},
        expirationDate: '',
        issuanceDate: '',
        issuer: '',
        type: [],

        '@context': [],
        proof: {
          type: '',
          created: '',
          proofPurpose: '',
          verificationMethod: '',
          jws: '',
        },
      } as IVerifiableCredential,
    ];
  }

  public getError2(): SelectResults {
    return {
      areRequiredCredentialsPresent: Status.INFO,
      errors: [
        {
          message: PexMessages.URI_EVALUATION_DIDNT_PASS,
          status: 'error',
          tag: 'UriEvaluation',
        },
        {
          message: PexMessages.URI_EVALUATION_DIDNT_PASS,
          status: 'error',
          tag: 'UriEvaluation',
        },
        {
          message: PexMessages.INPUT_CANDIDATE_FAILED_FILTER_EVALUATION + ': $.input_descriptors[0]: $.verifiableCredential[1]',
          status: 'error',
          tag: 'FilterEvaluation',
        },
        {
          message: PexMessages.INPUT_CANDIDATE_FAILED_FILTER_EVALUATION + ': $.input_descriptors[0]: $.verifiableCredential[2]',
          status: 'error',
          tag: 'FilterEvaluation',
        },
        {
          message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION + ': $.input_descriptors[0]: $.verifiableCredential[0]',
          status: 'error',
          tag: 'MarkForSubmissionEvaluation',
        },
        {
          message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION + ': $.input_descriptors[0]: $.verifiableCredential[2]',
          status: 'error',
          tag: 'MarkForSubmissionEvaluation',
        },
        {
          message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION + ': $.input_descriptors[0]: $.verifiableCredential[1]',
          status: 'error',
          tag: 'MarkForSubmissionEvaluation',
        },
      ],
      warnings: [],
    };
  }
}
