import {PresentationDefinition} from "@sphereon/pe-models";

export class PdRequireIsHolder {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      input_descriptors: [
        {
          id: "banking_input_2",
          constraints: {
            fields: [
              {
                id: "accounts",
                path: [
                  "$.issuer"
                ]
              }
            ],
            is_holder: [
              {
                directive: "required",
                field_id: [
                  "accounts"
                ]
              }
            ]
          }
        },
        {
          id: "employment_input",
          constraints: {
            fields: [
              {
                id: "active",
                path: [
                  "$.issuer"
                ]
              }
            ],
            is_holder: [
              {
                directive: "required",
                field_id: [
                  "active"
                ]
              }
            ]
          }
        },
        {
          id: "citizenship_input_1",
          constraints: {
            fields: [
              {
                id: "license",
                path: [
                  "$.issuer"
                ]
              }
            ],
            is_holder: [
              {
                directive: "preferred",
                field_id: [
                  "license",
                  "test"
                ]
              }
            ]
          }
        },
        {
          id: "banking_input_2",
          constraints: {
            fields: [
              {
                id: "accounts",
                path: [
                  "$.issuer"
                ]
              }
            ],
            is_holder: [
              {
                directive: "preferred",
                field_id: [
                  "accounts"
                ]
              }
            ]
          }
        }
      ]
    };
  }
}
