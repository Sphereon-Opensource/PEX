import {PresentationDefinition} from "@sphereon/pe-models";

export class PdSimpleSchemaSubjectIsIssuerExample {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "31e2f0f1-6b70-411d-b239-56aed5321884",
      purpose: "To sell you a drink we need to know that you are an adult.",
      input_descriptors: [
        {
          id: "867bfe7a-5b91-46b2-9ba4-70028b8d9cc8",
          purpose: "Your age should be greater or equal to 18.",
          schema: [
            {
              uri: "https://www.w3.org/TR/vc-data-model/#types"
            }
          ],
          constraints: {
            subject_is_issuer: "required",
            fields: [
              {
                path: [
                  "$.credentialSubject.age"
                ],
                filter: {
                  type: "integer",
                  minimum: 18
                },
                predicate: "required"
              }
            ]
          }
        }
      ]
    };
  }
}
