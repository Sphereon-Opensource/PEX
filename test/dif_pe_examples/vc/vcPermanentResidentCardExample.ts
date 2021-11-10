import {VerifiableCredential} from "../../../lib";

export class VcPermanentResidentCardExample {

  public getVerifiableCredential(): VerifiableCredential {
    return {
      identifier: "83627465",
      name: "Permanent Resident Card",
      type: [
        "PermanentResidentCard",
        "verifiableCredential"
      ],
      id: "https://issuer.oidp.uscis.gov/credentials/83627465dsdsdsd",
      credentialSubject: {
        birthCountry: "Bahamas",
        id: "did:example:b34ca6cd37bbf23",
        type: [
          "PermanentResident",
          "Person"
        ],
        gender: "Female",
        familyName: "SMITH",
        givenName: "JANE",
        residentSince: "2015-01-01",
        lprNumber: "999-999-999",
        birthDate: "1958-07-17",
        commuterClassification: "C1",
        lprCategory: "C09",
        image: "data:image/png;base64,iVBORw0KGgokJggg=="
      },
      expirationDate: "2029-12-03T12:19:52Z",
      description: "Government of Example Permanent Resident Card.",
      issuanceDate: "2019-12-03T12:19:52Z",
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/citizenship/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
      ],
      issuer: "did:key:z6MkhfRoL9n7ko9d6LnB5jLB4aejd3ir2q6E2xkuzKUYESig",
      proof: {
        type: "Ed25519Signature2020",
        created: "2021-09-10T15:33:39Z",
        verificationMethod: "did:key:z6MkhfRoL9n7ko9d6LnB5jLB4aejd3ir2q6E2xkuzKUYESig#key-1",
        proofPurpose: "assertionMethod",
        proofValue: "z4CYETTeGFbMz67ocKtRMb2xVG5mm5VcMtUYcs5KTgCAT2LhrwPfrN3ruvXf8DFSz6VtryWYJTPSWtEjspwakmTAY",
      }
    };
  }
}
