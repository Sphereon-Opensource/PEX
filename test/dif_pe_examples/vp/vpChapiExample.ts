import {VerifiablePresentation} from "../../../lib";

export class VpChapiExample {

  public getVerifiablePresentation(): VerifiablePresentation {
    return {
      type: "web",
      dataType: "VerifiablePresentation",
      data: {
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
    };
  }
}
