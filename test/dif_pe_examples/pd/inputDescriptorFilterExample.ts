import {PresentationDefinition} from "@sphereon/pe-models";

export class InputDescriptorFilterExample {

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
        },
        {
          id: "us_passport_input",
          name: "US Passport",
          schema: [
            {
              uri: "did:foo:123/Collections/schema.us.gov/passport.json"
            }
          ],
          constraints: {
            fields: [
              {
                path: [
                  "A"
                ],
                filter: {
                  type: "string",
                  _const: "Chad"
                }
              },
              {
                path: [
                  "A"
                ],
                filter: {
                  type: "number",
                  exclusiveMaximum: 85
                }
              },
              {
                path: [
                  "A"
                ],
                filter: {
                  type: "number",
                  exclusiveMinimum: 10000
                }
              },
              {
                path: [
                  "A"
                ],
                filter: {
                  type: "string",
                  _enum: [
                    "red",
                    "yellow",
                    "blue"
                  ]
                }
              },
              {
                path: [
                  "A"
                ],
                filter: {
                  type: "number",
                  maximum: 65536
                }
              },
              {
                path: [
                  "A"
                ],
                filter: {
                  type: "number",
                  minimum: 18
                }
              },
              {
                path: [
                  "A"
                ],
                filter: {
                  type: "object",
                  not: {
                    const: "Karen"
                  }
                }
              },
              {
                path: [
                  "A"
                ],
                filter: {
                  type: "object",
                  not: {
                    enum: [
                      "red",
                      "yellow",
                      "blue"
                    ]
                  }
                }
              }
            ]
          }
        }
      ]
    };
  }
}
