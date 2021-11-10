import {PresentationDefinition} from "@sphereon/pe-models";

export class PdElementMustBeArrayExampleCorrected {

  public getPresentationDefinition(): PresentationDefinition {
    return {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      input_descriptors: [],
      format: {
        jwt: {
          alg: [
            "HS256",
            "HS512",
            "ES384"
          ]
        },
        jwt_vc: {
          alg: [
            "HS512",
            "ES384"
          ]
        },
        jwt_vp: {
          alg: [
            "HS256",
            "HS512"
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
      }
    };
  }
}
