import {PresentationDefinition} from "@sphereon/pe-models";

export class SrAllRuleExample {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      submission_requirements: [
        {
          name: "Banking Information",
          purpose: "We need you to prove you currently hold a bank account older than 12months.",
          rule: "pick",
          count: 1,
          from: "A"
        },
        {
          name: "Employment Information",
          purpose: "We are only verifying one current employment relationship, not any other information about employment.",
          rule: "all",
          from: "B"
        },
        {
          name: "Citizenship Information",
          rule: "pick",
          count: 1,
          from_nested: [
            {
              name: "United States Citizenship Proofs",
              purpose: "We need you to prove your US citizenship.",
              rule: "all",
              from: "C"
            },
            {
              name: "European Union Citizenship Proofs",
              purpose: "We need you to prove you are a citizen of an EU member state.",
              rule: "all",
              from: "D"
            }
          ]
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
                purpose: "We can only allow people with acceptable educational qualification",
                filter: {
                  type: "string",
                  pattern: "did:example:123|did:example:456"
                }
              }
            ]
          }
        },
        {
          id: "Employment Information",
          name: "Employment Information",
          purpose: "We are only verifying one current employment relationship, not any other information about employment.",
          group: ["B"],
          schema: [
            {
              uri: "https://company.example.com/letter.json"
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
                purpose: "We can only allow people with some experience qualification",
                filter: {
                  type: "string",
                  pattern: "did:example:123|did:example:456"
                }
              }
            ]
          }
        },
        {
          id: "United States Citizenship Proofs",
          name: "United States Citizenship Proofs",
          purpose: "We need you to prove your US citizenship.",
          group: ["C"],
          schema: [
            {
              uri: "https://us.example.com/id.json"
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
                purpose: "We allow people with residence status in the US",
                filter: {
                  type: "string",
                  pattern: "did:example:123|did:example:456"
                }
              }
            ]
          }
        },
        {
          id: "European Union Citizenship Proofs",
          name: "European Union Citizenship Proofs",
          purpose: "We need you to prove you are a citizen of an EU member state.",
          group: ["D"],
          schema: [
            {
              uri: "https://eu.example.com/id.json"
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
                purpose: "We allow people with residence status in the EU",
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
