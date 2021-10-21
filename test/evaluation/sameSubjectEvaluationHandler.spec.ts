import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClient, SameSubjectEvaluationHandler } from '../../lib';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('sameSubjectEvaluationHandler', () => {

  it('Should record as success when the fields requiring same subject belong to same subjects', () => {
    const pd: PresentationDefinition = getFile('./test/resources/pd_require_same_subject.json').presentation_definition;
    const results = getFile('./test/resources/sameSubjectEvaluationResults.json');

    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: SameSubjectEvaluationHandler = new SameSubjectEvaluationHandler(evaluationClient);
    evaluationClient.verifiablePresentation = {
      "@context":[
      "https://www.w3.org/2018/credentials/v1",
      "https://identity.foundation/presentation-exchange/submission/v1"
    ],
      "holder": "",
      "presentation_submission":{
        "id": "MO8q9vLDoUiqtYAmI6IBL",
        "definition_id": "32f54163-7166-48f1-93d8-ff217bdb0653",
        "descriptor_map": [
          {
            "id": "867bfe7a-5b91-46b2-9ba4-70028b8d9aaa",
            "format": "ldp_vc",
            "path": "$.verifiableCredential[0]"
          },
          {
            "id": "867bfe7a-5b91-46b2-9ba4-70028b8d9bbb",
            "format": "ldp_vc",
            "path": "$.verifiableCredential[1]"
          },
          {
            "id": "867bfe7a-5b91-46b2-9ba4-70028b8d9ccc",
            "format": "ldp_vc",
            "path": "$.verifiableCredential[2]"
          },
          {
            "id": "867bfe7a-5b91-46b2-9ba4-70028b8d9ddd",
            "format": "ldp_vc",
            "path": "$.verifiableCredential[3]"
          }
        ]
      },
      "type":[
        "VerifiablePresentation",
        "PresentationSubmission"
      ],
      "verifiableCredential":[
        {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          "credentialSchema": [
            {
              "id": "https://www.w3.org/TR/vc-data-model/#types"
            }
          ],
          "credentialSubject": { id: "VCSubject2020081200", "field1Key": "field1Value" },
          "id": "867bfe7a-5b91-46b2-aaaa-70028b8d9aaa",
          "issuer": "VC1Issuer",
          "issuanceDate": '',
          "type": "VerifiableCredential",
          "proof": { type: '', verificationMethod: '', proofPurpose: '', jws: '', created: ''}
        },
        {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          "credentialSchema": [
            {
              "id": "https://www.w3.org/TR/vc-data-model/#types"
            }
          ],
          "credentialSubject": { id: "VCSubject2020081200", "field2Key": "field2Value" },
          "id": "867bfe7a-5b91-46b2-bbbb-70028b8d9bbb",
          "issuer": "VC2Issuer",
          "issuanceDate": '',
          "type": "VerifiableCredential",
          "proof": { type: '', verificationMethod: '', proofPurpose: '', jws: '', created: ''}
        },
        {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          "credentialSchema": [
            {
              "id": "https://www.w3.org/TR/vc-data-model/#types"
            }
          ],
          "credentialSubject": { id: "VCSubject2020081205", "field3Key": "field3Value" },
          "id": "867bfe7a-5b91-46b2-cccc-70028b8d9ccc",
          "issuer": "VC3Issuer",
          "issuanceDate": '',
          "type": "VerifiableCredential",
          "proof": { type: '', verificationMethod: '', proofPurpose: '', jws: '', created: ''}
        },
        {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          "credentialSchema": [
            {
              "id": "https://www.w3.org/TR/vc-data-model/#types"
            }
          ],
          "credentialSubject": { id: "VCSubject2020081205", "field4Key": "field4Value" },
          "id": "867bfe7a-5b91-46b2-dddd-70028b8d9ddd",
          "issuer": "VC4Issuer",
          "issuanceDate": '',
          "type": "VerifiableCredential",
          "proof": { type: '', verificationMethod: '', proofPurpose: '', jws: '', created: ''}
        }
      ],
      "proof": { type: '', verificationMethod: '', proofPurpose: '', jws: '', created: ''}
    };
    evaluationHandler.handle(pd);
    expect(evaluationHandler.client.results).toEqual(results);
  });
});