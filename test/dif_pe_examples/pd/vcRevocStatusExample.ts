import {PresentationDefinition} from "@sphereon/pe-models";

export class VcRevocStatusExample {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      input_descriptors: [
        {
          id: "drivers_license_information",
          name: "Verify Valid License",
          purpose: "We need to know that your license has not been revoked.",
          schema: [
            {
              uri: "https://yourwatchful.gov/drivers-license-schema.json"
            }
          ],
          constraints: {
            fields: [
              {
                path: ["$.credentialStatus"]
              }
            ]
          }
        }
      ]
    };
  }
}
