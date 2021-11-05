import {VerifiablePresentation} from "../../../lib";

export class VpSimpleSubjectIsIssuerExample {

  public getVerifiablePresentation(): VerifiablePresentation {
    return {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://identity.foundation/presentation-exchange/submission/v1"
      ],
      "presentation_submission": {
        "id": "accd5adf-1dbf-4ed9-9ba2-d687476126cb",
        "definition_id": "31e2f0f1-6b70-411d-b239-56aed5321884",
        "descriptor_map": [
          {
            "id": "867bfe7a-5b91-46b2-9ba4-70028b8d9cc8",
            "format": "ldp_vp",
            "path": "$.verifiableCredential[0]"
          }
        ]
      },
      "type": [
        "VerifiablePresentation",
        "PresentationSubmission"
      ],
      "verifiableCredential": [
        {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          "credentialSchema": [
            {
              "id": "https://www.w3.org/TR/vc-data-model/#types"
            }
          ],
          "credentialSubject": {
            "id": "did:example:123",
            "age": 19
          },
          "id": "2dc74354-e965-4883-be5e-bfec48bf60c7",
          "issuer": "did:example:123",
          issuanceDate: "2021-11-04T00:00:02Z",
          "type": ["VerifiableCredential"],
          proof: {
            type: "Ed25519Signature2020",
            created: "2021-09-21T19:18:08Z",
            verificationMethod: "did:key:2021110406",
            proofPurpose: "assertionMethod",
            proofValue: "proofValue2021110407",
          }
        }
      ],
      holder: "holder2021110410",
      proof: {
        type: "Ed25519Signature2020",
        created: "2021-09-21T19:18:08Z",
        verificationMethod: "did:key:2021110412",
        proofPurpose: "assertionMethod",
        proofValue: "proofValue2021110413",
      }
    };
  }
}
