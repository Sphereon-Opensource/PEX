// This can be a wallet project
// This can also be a Verifier-Backen
import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { EvaluationResults, PEJS, SelectResults, VerifiableCredential } from '../../lib';

import { Wallet } from './Wallet';

describe('test scenario 2', () => {
  /**
   * This scenario contains a flow in which Alice wants to prove to Bob that she has some kind of Credentials.
   * Alice has previously contacted Bob and therefore know what he's expecting.
   * It means that Bob has already sent her a PresentationDefinition object.
   * Alice's wallet sends all of her available credentials to PEJS to see which one is useful
   * In the second example the PresentationDefinition object is a simple one. Bob is sending her a presentationDefinition with two InputDescriptors
   * Alice has two credential in her wallet that have the properties requested by Bob
   */
  it('should return the correct result', () => {
    const wallet1: { holder: string; verifiableCredentials: VerifiableCredential[] } = new Wallet().getWallet();
    const wallet2: { holder: string; verifiableCredentials: VerifiableCredential[] } = new Wallet().getWallet();
    wallet2.verifiableCredentials![2]!.credentialSubject.degree = {
      ...(wallet2.verifiableCredentials[2].credentialSubject.degree as any),
      name: 'bachelor of applied science',
    };
    const presentationDefinition = getPresentationDefinition();
    const holderPE: PEJS = new PEJS();
    const vcs = [...wallet1.verifiableCredentials, ...wallet2.verifiableCredentials];
    const evaluateResult: EvaluationResults = holderPE.evaluatePresentation(presentationDefinition, {
      '@context': [],
      type: [],
      verifiableCredential: vcs,
      holder: undefined as unknown as string,
    });
    expect(evaluateResult).toEqual({
      warnings: [],
      errors: [
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[1]: $[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[1]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[1]: $[1]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[3]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[1]: $[3]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[4]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[1]: $[4]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[0]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[1]: $[0]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[1]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[1]: $[1]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[3]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[1]: $[3]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[4]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[1]: $[4]',
        },
      ],
      value: expect.objectContaining({
        definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
        descriptor_map: [
          {
            id: 'e73646de-43e2-4d72-ba4f-090d01c11eac',
            format: 'ldp_vc',
            path: '$[2]',
          },
          {
            id: 'e73646de-43e2-4d72-ba4f-090d01c11eac',
            format: 'ldp_vc',
            path: '$[5]',
          },
          {
            id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
            format: 'ldp_vc',
            path: '$[2]',
          },
          {
            id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
            format: 'ldp_vc',
            path: '$[5]',
          },
        ],
      }),
    });
    const selectFromResult: SelectResults = holderPE.selectFrom(presentationDefinition, vcs, [wallet1.holder]);

    expect(selectFromResult).toEqual({
      areRequiredCredentialsPresent: 'info',
      errors: [
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[1]: $[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[1]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[1]: $[1]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[3]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[1]: $[3]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $[4]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[1]: $[4]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[0]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[1]: $[0]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[1]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[1]: $[1]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[3]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[1]: $[3]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $[4]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[1]: $[4]',
        },
      ],
      matches: [
        {
          name: undefined,
          rule: 'all',
          matches: ['$[0]', '$[1]'],
        },
      ],
      selectableVerifiableCredentials: [
        {
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
          issuer: 'did:web:vc.transmute.world',
          issuanceDate: '2020-03-16T22:37:26.544Z',
          id: 'http://example.gov/credentials/3732',
          type: ['VerifiableCredential', 'UniversityDegreeCredential'],
          credentialSubject: {
            id: 'did:key:z6MkjRagNiMu91DduvCvgEsqLZDVzrJzFrwahc4tXLt9DoHd',
            degree: {
              type: 'BachelorDegree',
              name: 'Bachelor of Science and Arts',
            },
          },
          proof: {
            type: 'Ed25519Signature2018',
            created: '2020-04-02T18:28:08Z',
            verificationMethod: 'did:web:vc.transmute.world#z6MksHh7qHWvybLg5QTPPdG2DgEjjduBDArV9EF9mRiRzMBN',
            proofPurpose: 'assertionMethod',
            jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YtqjEYnFENT7fNW-COD0HAACxeuQxPKAmp4nIl8jYAu__6IH2FpSxv81w-l5PvE1og50tS9tH8WyXMlXyo45CA',
          },
        },
        {
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
          issuer: 'did:web:vc.transmute.world',
          issuanceDate: '2020-03-16T22:37:26.544Z',
          id: 'http://example.gov/credentials/3732',
          type: ['VerifiableCredential', 'UniversityDegreeCredential'],
          credentialSubject: {
            id: 'did:key:z6MkjRagNiMu91DduvCvgEsqLZDVzrJzFrwahc4tXLt9DoHd',
            degree: {
              type: 'BachelorDegree',
              name: 'bachelor of applied science',
            },
          },
          proof: {
            type: 'Ed25519Signature2018',
            created: '2020-04-02T18:28:08Z',
            verificationMethod: 'did:web:vc.transmute.world#z6MksHh7qHWvybLg5QTPPdG2DgEjjduBDArV9EF9mRiRzMBN',
            proofPurpose: 'assertionMethod',
            jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YtqjEYnFENT7fNW-COD0HAACxeuQxPKAmp4nIl8jYAu__6IH2FpSxv81w-l5PvE1og50tS9tH8WyXMlXyo45CA',
          },
        },
      ],
      vcIndexes: [0, 1],
      warnings: [],
    });
    if (selectFromResult.selectableVerifiableCredentials) {
      const presentationSubmission: PresentationSubmission = holderPE.submissionFrom(
        presentationDefinition,
        selectFromResult.selectableVerifiableCredentials
      );
      expect(presentationSubmission).toEqual(
        expect.objectContaining({
          definition_id: '31e2f0f1-6b70-411d-b239-56aed5321884',
          descriptor_map: [
            {
              id: 'e73646de-43e2-4d72-ba4f-090d01c11eac',
              format: 'ldp_vc',
              path: '$[0]',
            },
            {
              id: 'e73646de-43e2-4d72-ba4f-090d01c11eac',
              format: 'ldp_vc',
              path: '$[1]',
            },
            {
              id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
              format: 'ldp_vc',
              path: '$[0]',
            },
            {
              id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
              format: 'ldp_vc',
              path: '$[1]',
            },
          ],
        })
      );
    }
  });
});

function getPresentationDefinition(): PresentationDefinition {
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
  };
}
