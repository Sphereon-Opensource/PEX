import {PresentationDefinition} from "@sphereon/pe-models";

export class InputDescriptorFilterSimpleExample {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      input_descriptors: [
        {
          id: "bankaccount_input",
          name: "Full Bank Account Routing Information",
          purpose: "We can only remit payment to a currently-valid bank account, submitted as an ABA RTN + Acct # or IBAN.",
          schema: [
            {
              uri: "https://bank-standards.example.com/fullaccountroute.json"
            }
          ],
          constraints: {
            limit_disclosure: "required",
            fields: [
              {
                path: [
                  "$.issuer",
                  "$.vc.issuer",
                  "$.iss"
                ],
                purpose: "We can only verify bank accounts if they are attested by a trusted bank, auditor, or regulatory authority.",
                filter: {
                  type: "string",
                  pattern: "did:example:123|did:example:456"
                }
              }
            ]
          }
        }
      ]
    };
  }
}
