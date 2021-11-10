import {VerifiablePresentation} from "../../../lib";

export class VpDidCommExample {

  public getVerifiablePresentation(): VerifiablePresentation {
    return {
      "@type": "https://didcomm.org/present-proof/%VER/presentation",
      "@id": "f1ca8245-ab2d-4d9c-8d7d-94bf310314ef",
      comment: "some comment",
      formats: [
        {
          attach_id: "2a3f1c4c-623c-44e6-b159-179048c51260",
          format: "dif/presentation-exchange/submission@v1.0"
        }
      ],
      "presentations~attach": [
        {
          "@id": "2a3f1c4c-623c-44e6-b159-179048c51260",
          "mime-type": "application/ld+json",
          data: {
            json: {
              comment: "Presentation Submission goes here",
              presentation_submission: {
                id: "a30e3b91-fb77-4d22-95fa-871689c322e2",
                definition_id: "32f54163-7166-48f1-93d8-ff217bdb0653",
                descriptor_map: [
                  {
                    id: "banking_input_2",
                    format: "jwt_vc",
                    path: "$.verifiableCredential[0]"
                  },
                  {
                    id: "employment_input",
                    format: "ldp_vc",
                    path: "$.verifiableCredential[1]"
                  },
                  {
                    id: "citizenship_input_1",
                    format: "ldp_vc",
                    path: "$.verifiableCredential[2]"
                  }
                ]
              }
            }
          }
        }
      ]
    };
  }
}
