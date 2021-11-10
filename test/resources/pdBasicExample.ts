import {PresentationDefinition} from "@sphereon/pe-models";

export class PdBasicExample {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      name: "Conference Entry Requirements",
      purpose: "We can only allow people associated with Washington State business representatives into conference areas",
      format: {
        jwt: {
          alg: [
            "ES384"
          ]
        },
        jwt_vc: {
          alg: [
            "ES384"
          ]
        },
        jwt_vp: {
          alg: [
            "ES384"
          ]
        },
        ldp_vc: {
          proof_type: [
            "JsonWebSignature2020",
            "Ed25519Signature2018",
            "EcdsaSecp256k1Signature2019",
            "RsaSignature2018"
          ]
        },
        ldp_vp: {
          proof_type: [
            "Ed25519Signature2018"
          ]
        },
        ldp: {
          proof_type: [
            "RsaSignature2018"
          ]
        }
      },
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
