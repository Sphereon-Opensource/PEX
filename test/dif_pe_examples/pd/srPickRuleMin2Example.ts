import {PresentationDefinition} from "@sphereon/pe-models";

export class SrPickRuleMin2Example {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      submission_requirements: [
        {
          name: "Eligibility to Work Proof",
          purpose: "We need to prove you are eligible for full-time employment in 2 or more of the following countries",
          rule: "pick",
          min: 2,
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
