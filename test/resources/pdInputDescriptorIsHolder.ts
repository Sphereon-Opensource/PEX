import {PresentationDefinition} from "@sphereon/pe-models";

export class PdInputDescriptorIsHolder {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      input_descriptors: [
        {
          id: "banking_input_1",
          name: "Bank Account Information",
          purpose: "We can only remit payment to a currently-valid bank account.",
          group: [
            "A"
          ],
          schema: [
            {
              uri: "https://bank-schemas.org/1.0.0/accounts.json"
            },
            {
              uri: "https://bank-schemas.org/2.0.0/accounts.json"
            }
          ],
          constraints: {
            fields: [
              {
                path: [
                  "$.issuer",
                  "$.vc.issuer",
                  "$.iss"
                ],
                purpose: "We can only verify bank accounts if they are attested by a trusted bank, auditor or regulatory authority.",
                filter: {
                  type: "string",
                  pattern: "did:example:123|did:foo:123"
                }
              }
            ],
            is_holder: [
              {
                field_id: ["1234567890", "2457913570"],
                directive: "preferred"
              },
              {
                field_id: ["1234567890", "2457913570"],
                directive: "required"
              }
            ]
          }
        }
      ]
    };
  }
}
