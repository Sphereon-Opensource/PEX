import {PresentationDefinition} from "@sphereon/pe-models";

export class PdRequireSameSubject {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      input_descriptors: [
        {
          id: "867bfe7a-5b91-46b2-9ba4-70028b8d9aaa",
          constraints: {
            fields: [
              {
                id: "field1Key",
                path: [
                  "$.field1Key"
                ]
              }
            ],
            same_subject: [
              {
                directive: "required",
                field_id: [
                  "field1Key",
                  "field2Key"
                ]
              }
            ]
          }
        },
        {
          id: "867bfe7a-5b91-46b2-9ba4-70028b8d9bbb",
          constraints: {
            fields: [
              {
                id: "field2Key",
                path: [
                  "$.field2Key"
                ]
              }
            ]
          }
        },
        {
          id: "867bfe7a-5b91-46b2-9ba4-70028b8d9ccc",
          constraints: {
            fields: [
              {
                id: "field3Key",
                path: [
                  "$.field3Key"
                ]
              }
            ],
            same_subject: [
              {
                directive: "preferred",
                field_id: [
                  "field3Key",
                  "field4Key"
                ]
              }
            ]
          }
        },
        {
          id: "867bfe7a-5b91-46b2-9ba4-70028b8d9ddd",
          constraints: {
            fields: [
              {
                id: "field4Key",
                path: [
                  "$.field4Key"
                ]
              }
            ]
          }
        }
      ]
    };
  }
}
