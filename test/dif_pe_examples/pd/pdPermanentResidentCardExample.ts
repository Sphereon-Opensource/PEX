import {PresentationDefinition} from "@sphereon/pe-models";

export class PdPermanentResidentCardExample {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0654",
      input_descriptors: [
        {
          constraints: {
            fields: [
              {
                path: [
                  "$.credentialSubject.familyName"
                ],
                purpose: "The claim must be from one of the specified issuers",
                id: "1f44d55f-f161-4938-a659-f8026467f126"
              },
              {
                path: [
                  "$.credentialSubject.givenName"
                ],
                purpose: "The claim must be from one of the specified issuers"
              }
            ],
            limit_disclosure: "required",
            is_holder: [
              {
                directive: "required",
                field_id: [
                  "1f44d55f-f161-4938-a659-f8026467f126"
                ]
              }
            ]
          },
          schema: [
            {
              uri: "https://www.w3.org/2018/credentials#VerifiableCredential"
            },
            {
              uri: "https://w3id.org/citizenship#PermanentResident"
            },
            {
              uri: "https://w3id.org/citizenship/v1"
            }
          ],
          name: "EU Driver's License",
          group: [
            "A"
          ],
          id: "citizenship_input_1"
        }
      ],
      format: {
        ldp_vp: {
          proof_type: [
            "Ed25519Signature2018"
          ]
        }
      }
    };
  }
}
