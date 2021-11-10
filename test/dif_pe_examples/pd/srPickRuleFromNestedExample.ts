import {PresentationDefinition} from "@sphereon/pe-models";

export class SrPickRuleFromNestedExample {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      submission_requirements: [
        {
          name: "Confirm banking relationship or employment and residence proofs",
          purpose: "Recent bank statements or proofs of both employment and residence will be validated to initiate your loan application but not stored",
          rule: "pick",
          count: 1,
          from_nested: [
            {
              rule: "all",
              from: "A"
            },
            {
              rule: "pick",
              count: 2,
              from: "B"
            }
          ]
        }
      ],
      input_descriptors: [
        {
          id: "2021-05-19 01",
          name: "Confirm banking relationship or employment and residence proofs",
          purpose: "Recent bank statements or proofs of both employment and residence will be validated to initiate your loan application but not stored",
          group: ["A"],
          schema: [
            {
              uri: "https://university.example.com/fulltranscript.json"
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
                purpose: "We can only allow people with acceptable educational qualificaiton",
                filter: {
                  type: "string",
                  pattern: "did:example:123|did:example:456"
                }
              }
            ]
          }
        },
        {
          id: "2021-05-19 00",
          name: "Confirm banking relationship or employment and residence proofs",
          purpose: "Recent bank statements or proofs of both employment and residence will be validated to initiate your loan application but not stored",
          group: ["B"],
          schema: [
            {
              uri: "https://university.example.com/fulltranscript.json"
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
                purpose: "We can only allow people with acceptable educational qualificaiton",
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
