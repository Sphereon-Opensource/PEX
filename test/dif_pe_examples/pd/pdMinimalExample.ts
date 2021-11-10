import {PresentationDefinition} from "@sphereon/pe-models";

export class PdMinimalExample {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      input_descriptors: [
        {
          id: "wa_driver_license",
          name: "Washington State Business License",
          purpose: "We can only allow licensed Washington State business representatives into the WA Business Conference",
          schema: [
            {
              uri: "https://licenses.example.com/business-license.json"
            }
          ]
        }
      ]
    };
  }
}
