import {PresentationDefinition} from "@sphereon/pe-models";

export class SrAllRuleExample {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      submission_requirements: [
        {
          name: "Submission of educational transcripts",
          purpose: "We need your complete educational transcripts to process your application",
          rule: "all",
          from: "A"
        }
      ],
      input_descriptors: [
        {
          id: "Educational transcripts",
          name: "Submission of educational transcripts",
          purpose: "We need your complete educational transcripts to process your application",
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
        }
      ]
    };
  }
}
