import {HandlerCheckResult, SelectResults, VerifiableCredential} from "../../lib";
import {PresentationSubmission} from "@sphereon/pe-models";

export class EvaluationClientWrapperData {

  public getHolderDID(): string {
    return 'did:example:ebfeb1f712ebc6f1c276e12ec21';
  }

  public getInputDescriptorsDoesNotMatchResult0(): HandlerCheckResult {
    return {
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'error',
      message: '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
      payload: {
        inputDescriptorsUris: [
          'https://www.w3.org/TR/vc-data-model/#types1'
        ],
        presentationDefinitionUris: [
          'https://www.w3.org/2018/credentials/v1'
        ]
      }
    };
  }

  public getInputDescriptorsDoesNotMatchResult3(): HandlerCheckResult {
    return {
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'MarkForSubmissionEvaluation',
      status: 'error',
      message: 'The input candidate is not eligible for submission',
      payload: {
        evaluator: 'UriEvaluation',
        inputDescriptorsUris: [
          'https://www.w3.org/TR/vc-data-model/#types1'
        ],
        presentationDefinitionUris: [
          'https://www.w3.org/2018/credentials/v1'
        ]
      }
    }
  }

  public getUriInVerifiableCredentialDoesNotMatchResult0(): HandlerCheckResult {
    return {
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'UriEvaluation',
      status: 'error',
      message: '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
      payload: {
        inputDescriptorsUris: [
          'https://www.w3.org/2018/credentials/v1'
        ],
        presentationDefinitionUris: [
          'https://www.w3.org/TR/vc-data-model/#types1'
        ]
      }
    }
  }

  public getUriInVerifiableCredentialDoesNotMatchResult3(): HandlerCheckResult {
    return {
      input_descriptor_path: '$.input_descriptors[0]',
      verifiable_credential_path: '$[0]',
      evaluator: 'MarkForSubmissionEvaluation',
      status: 'error',
      message: 'The input candidate is not eligible for submission',
      payload: {
        evaluator: 'UriEvaluation',
        inputDescriptorsUris: [
          'https://www.w3.org/2018/credentials/v1'
        ],
        presentationDefinitionUris: [
          'https://www.w3.org/TR/vc-data-model/#types1'
        ]
      }
    };
  }

  public getForSubmissionRequirementsAllRuleResult0(): PresentationSubmission {
    return {
      id: "PresentationSubmission2021110401",
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {
          id: 'Educational transcripts',
          format: 'ldp_vc',
          path: '$[0]'
        }
      ]
    };
  }

  public getgetForSubmissionRequirementsPickRuleResult0(): PresentationSubmission {
    return {
      id: "PresentationSubmission2021110402",
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {
          format: 'ldp_vc',
          id: 'Educational transcripts 1',
          path: '$[0]'
        },
        {
          format: 'ldp_vc',
          id: 'Educational transcripts 2',
          path: '$[1]'
        },
      ]
    };
  }


  public getMax1FromBResult0(): PresentationSubmission {
    return {
      id: "PresentationSubmission2021110403",
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {'format': 'ldp_vc', 'id': 'Educational transcripts 1', 'path': '$[0]'}
      ]
    };
  }

  public getSuccessError(): SelectResults {
    return {
      errors: [
        {
          message: '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.: $.input_descriptors[0]: $[1]',
          status: 'error',
          tag: 'UriEvaluation'
        },
        {
          message: '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.: $.input_descriptors[0]: $[2]',
          status: 'error',
          tag: 'UriEvaluation'
        },
        {
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[1]',
          status: 'error',
          tag: 'FilterEvaluation'
        },
        {
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[2]',
          status: 'error',
          tag: 'FilterEvaluation'
        },
        {
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[1]',
          status: 'error',
          tag: 'MarkForSubmissionEvaluation'
        },
        {
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[2]',
          status: 'error',
          tag: 'MarkForSubmissionEvaluation'
        }
      ],
      warnings: []
    };
  }


  public getValue(): PresentationSubmission {
    return {
      id: "PresentationSubmission2021110400",
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {
          format: 'ldp_vc',
          id: 'bankaccount_input',
          path: '$[0]'
        }
      ]
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
            path: '$[0]'
          }
        ]
      }),
      warnings: []
    };
  }

  public getError() {
    return {
      errors: [
        {
          message: '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.: $.input_descriptors[0]: $[0]',
          status: 'error',
          tag: 'UriEvaluation'
        },
        {
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[0]',
          status: 'error',
          tag: 'MarkForSubmissionEvaluation'
        }
      ], warnings: []
    };
  }

  public getSelectResults(): SelectResults {
    return {
      verifiableCredentials: [
        {
          id: "CredentialID2021110405",
          credentialStatus: {
            id: "",
            type: ""
          },
          credentialSubject: {},
          expirationDate: "",
          issuanceDate: "",
          issuer: "",
          type: [],

          "@context": [],
          proof: {
            type: "",
            created: "",
            proofPurpose: "",
            verificationMethod: "",
            jws: ""
          }
        }
      ],
      vcIndexes: [],
    };
  }

  public getVerifiableCredential(): VerifiableCredential[] {
    return [
      {
        id: "CredentialID2021110100",
        credentialStatus: {
          id: "",
          type: ""
        },
        credentialSubject: {},
        expirationDate: "",
        issuanceDate: "",
        issuer: "",
        type: [],

        "@context": [],
        proof: {
          type: "",
          created: "",
          proofPurpose: "",
          verificationMethod: "",
          jws: ""
        }
      },
      {
        id: "CredentialID2021110405",
        credentialStatus: {
          id: "",
          type: ""
        },
        credentialSubject: {},
        expirationDate: "",
        issuanceDate: "",
        issuer: "",
        type: [],

        "@context": [],
        proof: {
          type: "",
          created: "",
          proofPurpose: "",
          verificationMethod: "",
          jws: ""
        }
      },
      {
        id: "CredentialID2021110100",
        credentialStatus: {
          id: "",
          type: ""
        },
        credentialSubject: {},
        expirationDate: "",
        issuanceDate: "",
        issuer: "",
        type: [],

        "@context": [],
        proof: {
          type: "",
          created: "",
          proofPurpose: "",
          verificationMethod: "",
          jws: ""
        }
      }
    ]
  }

  public getError2(): SelectResults {
    return {
      errors: [
        {
          message: '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.: $.input_descriptors[0]: $[0]',
          status: 'error',
          tag: 'UriEvaluation'
        },
        {
          message: '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.: $.input_descriptors[0]: $[2]',
          status: 'error',
          tag: 'UriEvaluation'
        },
        {
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[1]',
          status: 'error',
          tag: 'FilterEvaluation'
        },
        {
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[2]',
          status: 'error',
          tag: 'FilterEvaluation'
        },
        {
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[0]',
          status: 'error',
          tag: 'MarkForSubmissionEvaluation'
        },
        {
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[2]',
          status: 'error',
          tag: 'MarkForSubmissionEvaluation'
        },
        {
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[1]',
          status: 'error',
          tag: 'MarkForSubmissionEvaluation'
        }
      ],
      warnings: []
    };

  }
}
