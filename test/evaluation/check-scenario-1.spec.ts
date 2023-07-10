import { PresentationDefinitionV1 as PdV1 } from '@sphereon/pex-models';
import { IVerifiableCredential } from '@sphereon/ssi-types';

import { PEX } from '../../lib';

import { Wallet } from './core/Wallet';

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = ['BbsBlsSignatureProof2020'];

describe('1st scenario', () => {
  /**
   * This scenario contains a flow in which Alice wants to prove to Bob that she has some kind of Credentials.
   * Alice has previously contacted Bob and therefore know what he's expecting.
   * It means that Bob has already sent her a PresentationDefinition object.
   * now, Alice has to look into her wallet and select the credentials that she knows she will need for the actual proof.
   * In the first example the PresentationDefinition object is a simple one. Bob is sending her a presentationDefinition with two InputDescriptors
   * Alice has only one credential in her wallet that have the properties requested by Bob
   */
  it('should return ok get the right presentationSubmission', function () {
    const pd: PdV1 = getPresentationDefinition();
    /**
     * optional, first we want to make sure that the presentationDefinition object that we got is correct
     */
    const result = PEX.validateDefinition(pd);
    expect(result).toEqual([{ tag: 'root', status: 'info', message: 'ok' }]);
    const wallet: Wallet = new Wallet();
    /**
     * we get the verifiableCredentials from our wallet
     */
    const holderWallet: { holder: string; verifiableCredentials: IVerifiableCredential[] } = wallet.getWallet();
    expect(holderWallet.holder).toEqual('did:key:z6MkjRagNiMu91DduvCvgEsqLZDVzrJzFrwahc4tXLt9DoHd');
    /**
     * evaluation result will be:
     evaluationResult:  {
      "warnings": [],
      "errors": [
        {
          "tag": "FilterEvaluation",
          "status": "error",
          "message": "Input candidate failed filter evaluation: $.input_descriptors[0]: $[0]"
        },
        {
          "tag": "FilterEvaluation",
          "status": "error",
          "message": "Input candidate does not contain property: $.input_descriptors[1]: $[0]"
        },
        {
          "tag": "FilterEvaluation",
          "status": "error",
          "message": "Input candidate failed filter evaluation: $.input_descriptors[0]: $[1]"
        },
        {
          "tag": "FilterEvaluation",
          "status": "error",
          "message": "Input candidate does not contain property: $.input_descriptors[1]: $[1]"
        },
        {
          "tag": "MarkForSubmissionEvaluation",
          "status": "error",
          "message": "The input candidate is not eligible for submission: $.input_descriptors[0]: $[0]"
        },
        {
          "tag": "MarkForSubmissionEvaluation",
          "status": "error",
          "message": "The input candidate is not eligible for submission: $.input_descriptors[1]: $[0]"
        },
        {
          "tag": "MarkForSubmissionEvaluation",
          "status": "error",
          "message": "The input candidate is not eligible for submission: $.input_descriptors[0]: $[1]"
        },
        {
          "tag": "MarkForSubmissionEvaluation",
          "status": "error",
          "message": "The input candidate is not eligible for submission: $.input_descriptors[1]: $[1]"
        }
      ],
      "value": {
        "id": "lHLhHOZzvJ9Lkb3aORdBW",
        "definition_id": "31e2f0f1-6b70-411d-b239-56aed5321884",
        "descriptor_map": [
          {
            "id": "e73646de-43e2-4d72-ba4f-090d01c11eac",
            "format": "ldp_vc",
            "path": "$[2]"
          },
          {
            "id": "867bfe7a-5b91-46b2-9ba4-70028b8d9cc8",
            "format": "ldp_vc",
            "path": "$[2]"
          }
        ]
      }
    }
     */
    const pex = new PEX();
    const evaluationResult = pex.evaluatePresentation(
      pd,
      {
        '@context': [],
        holder: holderWallet.holder,
        type: [],
        verifiableCredential: holderWallet.verifiableCredentials,
      },
      { limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES, generatePresentationSubmission: true },
    );
    expect(evaluationResult.value?.definition_id).toEqual('31e2f0f1-6b70-411d-b239-56aed5321884');
    expect(evaluationResult.value?.descriptor_map.length).toEqual(2);
    expect(evaluationResult.value?.definition_id).toEqual('31e2f0f1-6b70-411d-b239-56aed5321884');
    expect(evaluationResult.value?.descriptor_map.map((dm) => dm.id).sort()).toEqual([
      '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
      'e73646de-43e2-4d72-ba4f-090d01c11eac',
    ]);
    /**
     * selectFrom will result is this object. which is pointing Alice to the right VC to send. By processing it,
     * Alice will understand that she needs to send only one object, and that object is in fact index 2 of the verifiableCredential list
     selectFromResult:  {
      "errors": [
        {
          "tag": "FilterEvaluation",
          "status": "error",
          "message": "Input candidate failed filter evaluation: $.input_descriptors[0]: $[0]"
        },
        {
          "tag": "FilterEvaluation",
          "status": "error",
          "message": "Input candidate does not contain property: $.input_descriptors[1]: $[0]"
        },
        {
          "tag": "FilterEvaluation",
          "status": "error",
          "message": "Input candidate failed filter evaluation: $.input_descriptors[0]: $[1]"
        },
        {
          "tag": "FilterEvaluation",
          "status": "error",
          "message": "Input candidate does not contain property: $.input_descriptors[1]: $[1]"
        },
        {
          "tag": "MarkForSubmissionEvaluation",
          "status": "error",
          "message": "The input candidate is not eligible for submission: $.input_descriptors[0]: $[0]"
        },
        {
          "tag": "MarkForSubmissionEvaluation",
          "status": "error",
          "message": "The input candidate is not eligible for submission: $.input_descriptors[1]: $[0]"
        },
        {
          "tag": "MarkForSubmissionEvaluation",
          "status": "error",
          "message": "The input candidate is not eligible for submission: $.input_descriptors[0]: $[1]"
        },
        {
          "tag": "MarkForSubmissionEvaluation",
          "status": "error",
          "message": "The input candidate is not eligible for submission: $.input_descriptors[1]: $[1]"
        }
      ],
      "matches": [
        {
          "rule": "all",
          "matches": [
            "$[2]"
          ]
        }
      ],
      "verifiableCredentials": [
        {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
          ],
          "issuer": "did:web:vc.transmute.world",
          "issuanceDate": "2020-03-16T22:37:26.544Z",
          "id": "http://example.gov/credentials/3732",
          "type": [
            "VerifiableCredential",
            "UniversityDegreeCredential"
          ],
          "credentialSubject": {
            "id": "did:key:z6MkjRagNiMu91DduvCvgEsqLZDVzrJzFrwahc4tXLt9DoHd",
            "degree": {
              "type": "BachelorDegree",
              "name": "Bachelor of Science and Arts"
            }
          },
          "proof": {
            "type": "Ed25519Signature2018",
            "created": "2020-04-02T18:28:08Z",
            "verificationMethod": "did:web:vc.transmute.world#z6MksHh7qHWvybLg5QTPPdG2DgEjjduBDArV9EF9mRiRzMBN",
            "proofPurpose": "assertionMethod",
            "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YtqjEYnFENT7fNW-COD0HAACxeuQxPKAmp4nIl8jYAu__6IH2FpSxv81w-l5PvE1og50tS9tH8WyXMlXyo45CA"
          }
        }
      ],
      "warnings": []
    }
     */
    const selectFromResult = pex.selectFrom(pd, holderWallet.verifiableCredentials, {
      holderDIDs: [holderWallet.holder],
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(selectFromResult.matches?.length).toEqual(2);
    expect(selectFromResult.matches).toEqual([
      { rule: 'all', vc_path: ['$.verifiableCredential[0]'], name: 'e73646de-43e2-4d72-ba4f-090d01c11eac' },
      { rule: 'all', vc_path: ['$.verifiableCredential[0]'], name: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8' },
    ]);
    expect(selectFromResult.verifiableCredential?.length).toEqual(1);

    /**
     * Base on the selectFrom result, now Alice knows what to send, so she will call the presentationFrom with the right VerifiableCredential (index #2)
     * and she will get a presentationSubmission object:
     submissionFromResult:  {
      "id": "FEkF4tcII0CXVnv1mWyr-",
      "definition_id": "31e2f0f1-6b70-411d-b239-56aed5321884",
      "descriptor_map": [
        {
          "id": "e73646de-43e2-4d72-ba4f-090d01c11eac",
          "format": "ldp_vc",
          "path": "$[0]"
        },
        {
          "id": "867bfe7a-5b91-46b2-9ba4-70028b8d9cc8",
          "format": "ldp_vc",
          "path": "$[0]"
        }
      ]
    }

     which is wrong in the case of our example, because the index of our verifiableCredential is no longer #2, but it's "1"
     */
    const presentationResult = pex.presentationFrom(pd, [holderWallet.verifiableCredentials[2]], { holderDID: 'did:didMethod:2021112400' });
    const presentation = presentationResult.presentation;
    expect(presentation!.presentation_submission!.definition_id).toEqual('31e2f0f1-6b70-411d-b239-56aed5321884');
    expect(presentation!.presentation_submission!.descriptor_map.map((dm) => dm.id).sort()).toEqual([
      '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
      'e73646de-43e2-4d72-ba4f-090d01c11eac',
    ]);
    /**
     * But what happens if we pass another VerifiableCredential and not the right one?
     {
  "id": "qRyzqwZI160EmFqEBwuDk",
  "definition_id": "31e2f0f1-6b70-411d-b239-56aed5321884",
  "descriptor_map": [
    {
      "id": "e73646de-43e2-4d72-ba4f-090d01c11eac",
      "format": "ldp_vc",
      "path": "$.verifiableCredential[2]"
    }
  ]
}
     As you can see, no matter what we pass, we will get the same result
     */
    expect(() => {
      new PEX().presentationFrom(pd, [holderWallet.verifiableCredentials[1]], { holderDID: 'did:didMethod: 2021112401' });
    }).toThrowError('You need to call evaluate() before pex.presentationFrom()');
  });
});

function getPresentationDefinition(): PdV1 {
  return {
    id: '31e2f0f1-6b70-411d-b239-56aed5321884',
    purpose: 'To check if you have a valid college degree.',
    input_descriptors: [
      {
        id: 'e73646de-43e2-4d72-ba4f-090d01c11eac',
        purpose: 'The issuer of your Bachelor degree should be a valid one.',
        schema: [
          {
            uri: 'https://www.w3.org/2018/credentials/v1',
          },
        ],
        constraints: {
          fields: [
            {
              path: ['$.issuer', '$.vc.issuer', '$.iss'],
              filter: {
                type: 'string',
                pattern: 'did:web:vc.transmute.world',
              },
            },
          ],
        },
      },
      {
        id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
        purpose: 'Your degree must be from type BachelorDegree.',
        schema: [
          {
            uri: 'https://www.w3.org/2018/credentials/v1',
          },
        ],
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.degree.type', '$.vc.credentialSubject.degree.type'],
              filter: {
                type: 'string',
                pattern: 'BachelorDegree',
              },
            },
          ],
        },
      },
    ],
  } as PdV1;
}
