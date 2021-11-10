import {PresentationDefinition} from "@sphereon/pe-models";

export class SrRules {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      submission_requirements: [
        {
          name: "Submission of educational transcripts",
          purpose: "We need your complete educational transcripts to process your application",
          rule: "all",
          from: "A"
        },
        {
          name: "Eligibility to Work Proof",
          purpose: "We need to prove you are eligible for full-time employment in 2 or more of the following countries",
          rule: "pick",
          min: 2,
          from: "B"
        },
        {
          name: "Confirm banking relationship or employment and residence proofs",
          purpose: "Recent bank statements or proofs of both employment and residence will be validated to initiate your loan application but not stored",
          rule: "pick",
          count: 1,
          from_nested: [
            {rule: "all", from: "A"},
            {rule: "pick", count: 2, from: "B"}
          ]
        },
        {
          name: "Eligibility to Work Proof",
          purpose: "We need to prove you are eligible for full-time employment in 2 or more of the following countries",
          rule: "pick",
          max: 2,
          from: "B"
        },
        {
          name: "Eligibility to Work Proof",
          purpose: "We need to prove you are eligible for full-time employment in 2 or more of the following countries",
          rule: "pick",
          min: 3,
          from: "B"
        },
        {
          name: "Eligibility to Work Proof",
          purpose: "We need to prove you are eligible for full-time employment in 2 or more of the following countries",
          rule: "pick",
          max: 1,
          from: "B"
        },
        {
          name: "Eligibility to Work Proof",
          purpose: "We need to prove you are eligible for full-time employment in 2 or more of the following countries",
          rule: "pick",
          count: 1,
          from: "B"
        },
        {
          name: "Submission of educational transcripts",
          purpose: "We need your complete educational transcripts to process your application",
          rule: "all",
          from: "B"
        },
        {
          name: "Confirm banking relationship or employment and residence proofs",
          purpose: "Recent bank statements or proofs of both employment and residence will be validated to initiate your loan application but not stored",
          rule: "all",
          from_nested: [
            {rule: "all", from: "A"},
            {rule: "pick", count: 2, from: "B"}
          ]
        },
        {
          name: "Confirm banking relationship or employment and residence proofs",
          purpose: "Recent bank statements or proofs of both employment and residence will be validated to initiate your loan application but not stored",
          rule: "pick",
          min: 1,
          from_nested: [
            {rule: "all", from: "A"},
            {rule: "pick", count: 2, from: "B"}
          ]
        },
        {
          name: "Confirm banking relationship or employment and residence proofs",
          purpose: "Recent bank statements or proofs of both employment and residence will be validated to initiate your loan application but not stored",
          rule: "pick",
          max: 2,
          from_nested: [
            {rule: "all", from: "A"},
            {rule: "pick", count: 2, from: "B"}
          ]
        },
        {
          name: "Confirm banking relationship or employment and residence proofs",
          purpose: "Recent bank statements or proofs of both employment and residence will be validated to initiate your loan application but not stored",
          rule: "pick",
          min: 3,
          from_nested: [
            {rule: "all", from: "A"},
            {rule: "pick", count: 2, from: "B"}
          ]
        },
        {
          name: "Confirm banking relationship or employment and residence proofs",
          purpose: "Recent bank statements or proofs of both employment and residence will be validated to initiate your loan application but not stored",
          rule: "pick",
          max: 1,
          from_nested: [
            {rule: "all", from: "A"},
            {rule: "pick", count: 2, from: "B"}
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
              uri: "https://eu.com/claims/DriversLicense"
            }
          ],
          constraints: {
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
          id: "Educational transcripts 1",
          name: "Submission of educational transcripts",
          purpose: "We need your complete educational transcripts to process your application",
          group: ["A", "B"],
          schema: [
            {
              uri: "https://business-standards.org/schemas/employment-history.json"
            }
          ],
          constraints: {
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
                  pattern: "did:foo:123|did:foo:456"
                }
              }
            ]
          }
        },
        {
          id: "Educational transcripts 2",
          name: "Submission of educational transcripts",
          purpose: "We need your complete educational transcripts to process your application",
          group: ["A", "B"],
          schema: [
            {
              uri: "https://www.w3.org/2018/credentials/v1"
            }
          ],
          constraints: {
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
                  pattern: "did:foo:123|did:foo:456"
                }
              }
            ]
          }
        }
      ]
    };
  }
}
