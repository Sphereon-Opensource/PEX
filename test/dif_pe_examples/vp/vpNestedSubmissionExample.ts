import {VerifiablePresentation} from "../../../lib";

export class VpNestedSubmissionExample {

  public getVerifiablePresentation(): VerifiablePresentation {
    return {
      "@context": [
        "https://www.w3.org/2018/credentials/v1"
      ],
      type: [
        "VerifiablePresentation",
        "VerifiableCredential"
      ],
      presentation_submission: {
        id: "a30e3b91-fb77-4d22-95fa-871689c322e2",
        definition_id: "32f54163-7166-48f1-93d8-ff217bdb0653",
        descriptor_map: [
          {
            id: "banking_input_2",
            format: "jwt_vp",
            path: "$.outerClaim[0]",
            path_nested: {
              id: "banking_input_2",
              format: "ldp_vc",
              path: "$.innerClaim[1]",
              path_nested: {
                id: "banking_input_2",
                format: "jwt_vc",
                path: "$.mostInnerClaim[2]"
              }
            }
          }
        ]
      },
      verifiableCredential: [
        {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          id: "https://eu.com/claims/DriversLicense",
          type: ["EUDriversLicense"],
          issuer: "did:example:123",
          issuanceDate: "2010-01-01T19:73:24Z",
          credentialSubject: {
            id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
            accounts: [
              {
                id: "1234567890",
                route: "876543210"
              },
              {
                id: "2457913570",
                route: "DE-0753197542"
              }
            ]
          },
          proof: {
            type: "RsaSignature2018",
            created: "2017-06-18T21:19:10Z",
            proofPurpose: "assertionMethod",
            verificationMethod: "https://example.edu/issuers/keys/1",
          },

          innerClaim: [
            {
              "@context": "https://www.w3.org/2018/credentials/v1",
              id: "https://business-standards.org/schemas/employment-history.json",
              type: ["VerifiableCredential", "GenericEmploymentCredential"],
              issuanceDate: "2010-01-01T19:73:24Z",
              credentialSubject: {
                id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
                active: true
              },
              proof: {
                type: "EcdsaSecp256k1VerificationKey2019",
                created: "2017-06-18T21:19:10Z",
                proofPurpose: "assertionMethod",
                verificationMethod: "https://example.edu/issuers/keys/1",

              },
              mostInnerClaim: [
                {
                  "@context": "https://www.w3.org/2018/credentials/v1",
                  id: "https://business-standards.org/schemas/employment-history.json",
                  type: ["VerifiableCredential", "GenericEmploymentCredential"],
                  issuanceDate: "2010-01-01T19:73:24Z",
                  credentialSubject: {
                    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
                    active: true
                  },
                  proof: {
                    type: "EcdsaSecp256k1VerificationKey2019",
                    created: "2017-06-18T21:19:10Z",
                    proofPurpose: "assertionMethod",
                    verificationMethod: "https://example.edu/issuers/keys/1",
                  }
                },
                {
                  "@context": "https://www.w3.org/2018/credentials/v1",
                  id: "https://eu.com/claims/DriversLicense",
                  type: ["EUDriversLicense"],
                  issuanceDate: "2010-01-01T19:73:24Z",
                  credentialSubject: {
                    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
                    license: {
                      number: "34DGE352",
                      dob: "07/13/80"
                    }
                  },
                  proof: {
                    type: "RsaSignature2018",
                    created: "2017-06-18T21:19:10Z",
                    proofPurpose: "assertionMethod",
                    verificationMethod: "https://example.edu/issuers/keys/1",
                  }
                },
                {
                  comment: "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
                  vc: {
                    "@context": "https://www.w3.org/2018/credentials/v1",
                    id: "https://eu.com/claims/DriversLicense",
                    type: ["EUDriversLicense"],
                    issuer: "did:example:123",
                    issuanceDate: "2010-01-01T19:73:24Z",
                    credentialSubject: {
                      id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
                      accounts: [
                        {
                          id: "1234567890",
                          route: "876543210"
                        },
                        {
                          id: "2457913570",
                          route: "DE-0753197542"
                        }
                      ]
                    }
                  }
                }
              ]
            },
            {
              comment: "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
              vc: {
                "@context": "https://www.w3.org/2018/credentials/v1",
                id: "https://eu.com/claims/DriversLicense",
                type: ["EUDriversLicense"],
                issuer: "did:example:123",
                issuanceDate: "2010-01-01T19:73:24Z",
                credentialSubject: {
                  id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
                  accounts: [
                    {
                      id: "1234567890",
                      route: "876543210"
                    },
                    {
                      id: "2457913570",
                      route: "DE-0753197542"
                    }
                  ]
                }
              }
            }
          ],
        }
      ],
      holder: "holder2021110423",
      proof: {
        type: "RsaSignature2018",
        created: "2017-06-18T21:19:10Z",
        proofPurpose: "assertionMethod",
        verificationMethod: "https://example.edu/issuers/keys/1",
      }
    };
  }
}
