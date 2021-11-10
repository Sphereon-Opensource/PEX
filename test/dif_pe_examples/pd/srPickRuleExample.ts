import {PresentationDefinition} from "@sphereon/pe-models";

export class SrPickRuleExample {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      submission_requirements: [
        {
          name: "Citizenship Proof",
          purpose: "We need to confirm you are a citizen of one of the following countries before accepting your application",
          rule: "pick",
          count: 1,
          from: "B"
        }
      ],
      input_descriptors: [
        {
          id: "Educational transcripts",
          name: "Submission of educational transcripts",
          purpose: "We need your complete educational transcripts to process your application",
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
