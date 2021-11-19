import {Presentation} from "../../lib";


export class SigningUtilMock {
  public getSinged(): Presentation[] {
    return [
      {
        verifiableCredential: [],
        holder: "",
        "@context": [""],
        presentation_submission: {
          descriptor_map: [],
          definition_id: "",
          id: ""
        },
        type: [""]
      }
    ];
  }

  public getErrorThrown(): Presentation[] {
    throw new Error("Could not sign because of missing fields");
  }
}
