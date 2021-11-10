import {PresentationSubmission} from '@sphereon/pe-models';

export class VpPsExample {

  public getPresentationSubmission(): PresentationSubmission {
    return {
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
    };
  }
}
