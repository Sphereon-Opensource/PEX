import {HandlerCheckResult} from "../../lib";

export class IsHolderEvaluationResults {

  public getIsHolderEvaluationResults(): HandlerCheckResult[] {
    return [
      {
        evaluator: "IsHolderEvaluation",
        input_descriptor_path: "$.input_descriptors[2]",
        message: "The field id missing",
        payload: {
          credentialSubject: {},
          fieldIdSet: [
            "license",
            "test"
          ]
        },
        status: "error",
        verifiable_credential_path: ""
      },
      {
        evaluator: "IsHolderEvaluation",
        input_descriptor_path: "$.input_descriptors[0]",
        message: "The field ids requiring the subject to be the holder",
        payload: {
          credentialSubject: {
            id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
            accounts: [
              {
                id: "1234567890",
                route: "DE-9876543210"
              },
              {
                id: "2457913570",
                route: "DE-0753197542"
              }
            ]
          },
          fieldIdSet: [
            "accounts"
          ]
        },
        status: "info",
        verifiable_credential_path: "$[0]"
      },
      {
        evaluator: "IsHolderEvaluation",
        input_descriptor_path: "$.input_descriptors[1]",
        message: "The field id missing",
        payload: {
          credentialSubject: {
            active: true,
            id: "did:example:ebfeb1f712ebc6f1c276e12ec22"
          },
          fieldIdSet: [
            "active"
          ]
        },
        status: "error",
        verifiable_credential_path: "$[1]"
      },
      {
        evaluator: "IsHolderEvaluation",
        input_descriptor_path: "$.input_descriptors[3]",
        message: "The field ids preferring the subject to be the holder",
        payload: {
          credentialSubject: {
            accounts: [
              {
                id: "1234567890",
                route: "DE-9876543210"
              },
              {
                id: "2457913570",
                route: "DE-0753197542"
              }
            ],
            id: "did:example:ebfeb1f712ebc6f1c276e12ec21"
          },
          fieldIdSet: [
            "accounts"
          ]
        },
        status: "warn",
        verifiable_credential_path: "$[0]"
      }
    ];
  }
}
