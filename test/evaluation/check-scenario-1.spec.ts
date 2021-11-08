import { PresentationDefinition } from '@sphereon/pe-models';

import { PEJS, VerifiableCredential } from '../../lib';

import { Wallet } from './core/Wallet';

describe('1st scenario', () => {
  /**
   * This scenario contains a flow in which Alice wants to prove to Bob that she has some kind of Credentials.
   * Alice has previously contacted Bob and therefore know what he's expecting.
   * It means that Bob has already sent her a PresentationDefinition object.
   * now, Alice has to look into her wallet and select the credentials that she knows she will need for the actual proof.
   * In the first example the PresentationDefinition object is a simple one. Bob is sending her a presentationDefinition with two InputDescriptors
   * Alice has only one credential in her wallet that have the properties requested by Bob
   */
  it('should return ok get the right presentationSubmission', function() {
    const pd: PresentationDefinition = getPresentationDefinition();
    const pejs: PEJS = new PEJS();
    /**
     * optional, first we want to make sure that the presentationDefinition object that we got is correct
     */
    const result = pejs.validateDefinition(pd);
    console.log(result);
    const wallet: Wallet = new Wallet();
    /**
     * we get the verifiableCredentials from our wallet
     */
    const holderWallet: { holder: string, verifiableCredentials: VerifiableCredential[] } = wallet.getWallet();
    console.log('VCs: ', JSON.stringify(holderWallet.verifiableCredentials, null, 2));
    /**
     * evaluation result will be:
     {
  "warnings": [],
  "errors": [
    {
      "tag": "FilterEvaluation",
      "status": "error",
      "message": "Input candidate failed filter evaluation: $.input_descriptors[0]: $.verifiableCredential[0]"
    },
    {
      "tag": "FilterEvaluation",
      "status": "error",
      "message": "Input candidate does not contain property: $.input_descriptors[1]: $.verifiableCredential[0]"
    },
    {
      "tag": "FilterEvaluation",
      "status": "error",
      "message": "Input candidate failed filter evaluation: $.input_descriptors[0]: $.verifiableCredential[1]"
    },
    {
      "tag": "FilterEvaluation",
      "status": "error",
      "message": "Input candidate does not contain property: $.input_descriptors[1]: $.verifiableCredential[1]"
    },
    {
      "tag": "FilterEvaluation",
      "status": "error",
      "message": "Input candidate failed filter evaluation: $.input_descriptors[1]: $.verifiableCredential[2]"
    },
    {
      "tag": "MarkForSubmissionEvaluation",
      "status": "error",
      "message": "The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[0]"
    },
    {
      "tag": "MarkForSubmissionEvaluation",
      "status": "error",
      "message": "The input candidate is not eligible for submission: $.input_descriptors[1]: $.verifiableCredential[0]"
    },
    {
      "tag": "MarkForSubmissionEvaluation",
      "status": "error",
      "message": "The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[1]"
    },
    {
      "tag": "MarkForSubmissionEvaluation",
      "status": "error",
      "message": "The input candidate is not eligible for submission: $.input_descriptors[1]: $.verifiableCredential[1]"
    },
    {
      "tag": "MarkForSubmissionEvaluation",
      "status": "error",
      "message": "The input candidate is not eligible for submission: $.input_descriptors[1]: $.verifiableCredential[2]"
    }
  ],
  "value": {
    "id": "sWUxGJyL4wEIE79hAM9t8",
    "definition_id": "31e2f0f1-6b70-411d-b239-56aed5321884",
    "descriptor_map": [
      {
        "id": "e73646de-43e2-4d72-ba4f-090d01c11eac",
        "format": "ldp_vc",
        "path": "$.verifiableCredential[2]"
      }
    ]
  }
}
     */
    const evaluationResult = pejs.evaluate(pd, holderWallet.verifiableCredentials, [holderWallet.holder]);
    console.log('evaluationResult: ', JSON.stringify(evaluationResult, null, 2));

    /**
     * selectFrom will result is this object. which is pointing Alice to the right VC to send. By processing it,
     * Alice will understand that she needs to send only one object, and that object is in fact index 2 of the verifiableCredential list
     {
  "errors": [],
  "matches": [
    {
      "rule": "all",
      "count": 1,
      "matches": [
        "$.verifiableCredential[2]"
      ],
      "from": null,
      "from_nested": null
    }
  ],
  "warnings": []
}
     */
    const selectFromResult = pejs.selectFrom(pd, holderWallet.verifiableCredentials, [holderWallet.holder]);
    console.log('selectFromResult: ', JSON.stringify(selectFromResult, null, 2));

    /**
     * Base on the selectFrom result, now Alice knows what to send, so she will call the submissionFrom with the right VerifiableCredential (index #2)
     * and she will get a presentationSubmission object:
     {
  "id": "EfCv-Uioa_BauTcjMBstn",
  "definition_id": "31e2f0f1-6b70-411d-b239-56aed5321884",
  "descriptor_map": [
    {
      "id": "e73646de-43e2-4d72-ba4f-090d01c11eac",
      "format": "ldp_vc",
      "path": "$.verifiableCredential[0]"
    }
  ]
}

     which is wrong in the case of our example, because the index of our verifiableCredential is no longer #2, but it's "1"
     */
    const submissionFromResult = pejs.submissionFrom(pd, [holderWallet.verifiableCredentials[2]]);
    console.log('submissionFromResult: ', JSON.stringify(submissionFromResult, null, 2));

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
    const submissionFromResult1 = pejs.submissionFrom(pd, [holderWallet.verifiableCredentials[1]]);
    console.log('wrong VC passed >>');
    console.log('  - submissionFromResult: ', JSON.stringify(submissionFromResult1, null, 2));
  });

});

function getPresentationDefinition(): PresentationDefinition {
  return {
    'id': '31e2f0f1-6b70-411d-b239-56aed5321884',
    'purpose': 'To check if you have a valid college degree.',
    'input_descriptors': [
      {
        'id': 'e73646de-43e2-4d72-ba4f-090d01c11eac',
        'purpose': 'The issuer of your Bachelor degree should be a valid one.',
        'schema': [
          {
            'uri': 'https://www.w3.org/2018/credentials/v1'
          }
        ],
        'constraints': {
          'fields': [
            {
              'path': [
                '$.issuer',
                '$.vc.issuer',
                '$.iss'
              ],
              'filter': {
                'type': 'string',
                'pattern': 'did:web:vc.transmute.world'
              }
            }
          ]
        }
      },
      {
        'id': '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
        'purpose': 'Your degree must be from type BachelorDegree.',
        'schema': [
          {
            'uri': 'https://www.w3.org/2018/credentials/v1'
          }
        ],
        'constraints': {
          'fields': [
            {
              'path': [
                '$.credentialSubject.degree.type',
                '$.vc.credentialSubject.degree.type'
              ],
              'filter': {
                'type': 'string',
                'pattern': 'BachelorDegree'
              }
            }
          ]
        }
      }
    ]
  };
}
