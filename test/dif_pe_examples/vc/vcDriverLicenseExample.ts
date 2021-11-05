import {VerifiableCredential} from "../../../lib";

export class VcDriverLicenseExample {

  public getVerifiableCredential(): VerifiableCredential {
    return {
      description: "Government of Example Permanent Resident Card.",
      expirationDate: "2029-12-03T12:19:52Z",
      issuanceDate: "2019-12-03T12:19:52Z",
      id: "https://issuer.oidp.uscis.gov/credentials/83627465",
      name: "Permanent Resident Card",
      identifier: "83627465",
      credentialSubject: {
        birthDate: "1958-07-17",
        lprCategory: "C09",
        lprNumber: "999-999-999",
        image: "data:image/png;base64,iVBORw0KGgokJggg==",
        type: [
          "PermanentResident",
          "Person"
        ],
        commuterClassification: "C1",
        familyName: "SMITH",
        id: "did:example:b34ca6cd37bbf23",
        givenName: "JANE",
        gender: "Female",
        residentSince: "2015-01-01",
        birthCountry: "Bahamas"
      },
      type: [
        "VerifiableCredential",
        "PermanentResidentCard"
      ],
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1",
        "https://w3id.org/citizenship/v1"
      ],
      issuer: "did:key:z6MkuDyqwjCVhFFQEZdS5utguwYD2KRig2PEb9qbfP9iqwn9",
      proof: {
        type: "Ed25519Signature2020",
        created: "2021-09-21T19:18:08Z",
        verificationMethod: "did:key:z6MkuDyqwjCVhFFQEZdS5utguwYD2KRig2PEb9qbfP9iqwn9#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "z22TFxZwpiT3B7TEKTZNyRzYbf6GfrXo7Xv35nyJTH6xWkvQAAiRCdnjAg4tRA5qB3bA9zZ726CthFUQf8Y8f3p1R",
      }
    };
  }
}
