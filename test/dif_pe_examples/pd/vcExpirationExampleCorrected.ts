import {PresentationDefinition} from "@sphereon/pe-models";

export class VcExpirationExampleCorrected {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      input_descriptors: [
        {
          id: "drivers_license_information",
          name: "Verify Valid License",
          purpose: "We need you to show that your driver's license will be valid through December of this year.",
          schema: [
            {
              uri: "https://yourwatchful.gov/drivers-license-schema.json",
              required: true
            }
          ],
          constraints: {
            fields: [
              {
                path: ["$.expirationDate"],
                filter: {
                  type: "string",
                  format: "date-time",
                  formatMinimum: "2020-12-31T23:59:59.000Z"
                }
              }
            ]
          }
        }
      ]
    };
  }
}
