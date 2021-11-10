import {PresentationDefinition} from "@sphereon/pe-models";

export class PdDriverLicenseNameExample {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      submission_requirements: [
        {
          from: "A",
          purpose: "We need your driver's license name",
          rule: "all",
          name: "Name on driver's license"
        }
      ],
      id: "32f54163-7166-48f1-93d8-ff217bdb0654",
      input_descriptors: [
        {
          schema: [
            {
              uri: "https://www.w3.org/2018/credentials/v1"
            },
            {
              uri: "https://w3id.org/citizenship/v1"
            }
          ],
          group: [
            "A"
          ],
          constraints: {
            is_holder: [
              {
                field_id: [
                  "1f44d55f-f161-4938-a659-f8026467f126"
                ],
                directive: "required"
              }
            ],
            fields: [
              {
                purpose: "The claim must be from one of the specified issuers",
                id: "1f44d55f-f161-4938-a659-f8026467f126",
                path: [
                  "$.credentialSubject.familyName"
                ]
              },
              {
                purpose: "The claim must be from one of the specified issuers",
                path: [
                  "$.credentialSubject.givenName"
                ]
              }
            ],
            limit_disclosure: "required"
          },
          id: "citizenship_input_1",
          name: "EU Driver's License"
        }
      ],
      format: {
        ldp_vp: {
          proof_type: [
            "Ed25519VerificationKey2018"
          ]
        }
      }
    };
  }
}
