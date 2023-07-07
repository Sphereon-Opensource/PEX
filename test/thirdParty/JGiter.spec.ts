import { PresentationDefinitionV2, Rules } from '@sphereon/pex-models';
import { IPresentation, IProofType, IVerifiableCredential } from '@sphereon/ssi-types';

import { EvaluationResults, PEX, Status } from '../../lib';

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = [IProofType.BbsBlsSignatureProof2020];

function getPresentationDefinition_1(): PresentationDefinitionV2 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    submission_requirements: [
      {
        name: 'Identity requirement',
        rule: 'all',
        from: 'A',
      },
      {
        name: 'Role requirement',
        rule: 'all',
        from: 'B',
      },
    ],
    input_descriptors: [
      {
        id: 'identity_input',
        name: 'Subject identity input',
        group: ['A'],
        purpose: 'Subject should be identifiable',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.did'],
              filter: {
                type: 'string',
                const: 'did:example:d23dd687a7dc6787646f2eb98d0',
              },
            },
          ],
        },
      },
      {
        id: 'name_input',
        name: 'Subject name input',
        group: ['A'],
        purpose: 'Subject should have name',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.profile.name'],
              filter: {
                type: 'string',
                const: 'John',
              },
            },
          ],
        },
      },
      {
        id: 'role_input',
        name: 'Admin role input',
        group: ['B'],
        purpose: 'Subject should have admin role',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.role'],
              filter: {
                type: 'string',
                const: 'admin',
              },
            },
          ],
        },
      },
    ],
  };
}

function getPresentationDefinition_2(): PresentationDefinitionV2 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    submission_requirements: [
      {
        name: 'Identity requirement',
        rule: 'all',
        from: 'A',
      },
    ],
    input_descriptors: [
      {
        id: 'identity_input',
        name: 'Subject identity input',
        group: ['A'],
        purpose: 'Subject should be identifiable',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.did'],
              filter: {
                type: 'string',
                const: 'did:example:d23dd687a7dc6787646f2eb98d0',
              },
            },
          ],
        },
      },
      {
        id: 'name_input',
        name: 'Subject name input',
        group: ['A'],
        purpose: 'Subject should have name',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.profile.name'],
              filter: {
                type: 'string',
                const: 'John',
              },
            },
          ],
        },
      },
      {
        id: 'role_input',
        name: 'Admin role input',
        group: ['A'],
        purpose: 'Subject should have admin role',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.role'],
              filter: {
                type: 'string',
                const: 'admin',
              },
            },
          ],
        },
      },
    ],
  };
}

function getPresentationDefinition_3(): PresentationDefinitionV2 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    input_descriptors: [
      {
        id: 'identity_input',
        name: 'Subject identity input',
        purpose: 'Subject should be identifiable',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.did'],
              filter: {
                type: 'string',
                const: 'did:example:d23dd687a7dc6787646f2eb98d0',
              },
            },
          ],
        },
      },
      {
        id: 'name_input',
        name: 'Subject name input',
        purpose: 'Subject should have name',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.profile.name'],
              filter: {
                type: 'string',
                const: 'John',
              },
            },
          ],
        },
      },
      {
        id: 'role_input',
        name: 'Admin role input',
        purpose: 'Subject should have admin role',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.role'],
              filter: {
                type: 'string',
                const: 'admin',
              },
            },
          ],
        },
      },
    ],
  };
}

function getPresentationDefinition_4(): PresentationDefinitionV2 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    submission_requirements: [
      {
        name: 'Identity requirement',
        rule: 'pick',
        from: 'A',
        min: 2,
      },
    ],
    input_descriptors: [
      {
        id: 'identity_input',
        name: 'Subject identity input',
        group: ['A'],
        purpose: 'Subject should be identifiable',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.did'],
              filter: {
                type: 'string',
                const: 'did:example:d23dd687a7dc6787646f2eb98d0',
              },
            },
          ],
        },
      },
      {
        id: 'name_input',
        name: 'Subject name input',
        group: ['A'],
        purpose: 'Subject should have name',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.profile.name'],
              filter: {
                type: 'string',
                const: 'John',
              },
            },
          ],
        },
      },
      {
        id: 'role_input',
        name: 'Admin role input',
        group: ['A'],
        purpose: 'Subject should have admin role',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.role'],
              filter: {
                type: 'string',
                const: 'admin',
              },
            },
          ],
        },
      },
    ],
  };
}

function getPresentationDefinition_5(): PresentationDefinitionV2 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    submission_requirements: [
      {
        name: 'Identity requirement',
        rule: 'pick',
        from: 'A',
        count: 3,
      },
    ],
    input_descriptors: [
      {
        id: 'identity_input',
        name: 'Subject identity input',
        group: ['A'],
        purpose: 'Subject should be identifiable',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.did'],
              filter: {
                type: 'string',
                const: 'did:example:d23dd687a7dc6787646f2eb98d0',
              },
            },
          ],
        },
      },
      {
        id: 'name_input',
        name: 'Subject name input',
        group: ['A'],
        purpose: 'Subject should have name',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.profile.name'],
              filter: {
                type: 'string',
                const: 'John',
              },
            },
          ],
        },
      },
      {
        id: 'role_input',
        name: 'Admin role input',
        group: ['A'],
        purpose: 'Subject should have admin role',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.role'],
              filter: {
                type: 'string',
                const: 'admin',
              },
            },
          ],
        },
      },
    ],
  };
}

function getPresentationDefinition_6(): PresentationDefinitionV2 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    input_descriptors: [
      {
        id: 'some_id',
        name: 'Required credential',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.role'],
              filter: {
                type: 'string',
                const: 'admin',
              },
            },
          ],
        },
      },
    ],
  };
}

function getPresentationDefinition_7(): PresentationDefinitionV2 {
  return {
    id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    input_descriptors: [
      {
        id: 'some_id',
        name: 'Required credential role',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.role'],
              filter: {
                type: 'string',
                const: 'admin',
              },
            },
          ],
        },
      },
      {
        id: 'some_other_id',
        name: 'Required credential issuer',
        constraints: {
          fields: [
            {
              path: ['$.issuer'],
              filter: {
                type: 'string',
                const: 'did:example:123456789af312312i',
              },
            },
          ],
        },
      },
    ],
  };
}

function getVerifiableCredentials(): IVerifiableCredential[] {
  return [
    {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        {
          profile: { '@id': 'ctx_id:profile', '@type': 'ctx_id:profile' },
          name: 'ctx_id:name',
          Identity: 'ctx_id:Identity',
          did: 'ctx_id:did',
          ctx_id: 'https://example.org/ld-context-2022#',
        },
      ],
      id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
      type: ['VerifiableCredential', 'Identity'],
      credentialSubject: {
        did: 'did:example:d23dd687a7dc6787646f2eb98d0',
        profile: { name: 'John' },
      },
      issuer: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
      issuanceDate: '2022-03-18T08:57:32.477Z',
      proof: {
        type: 'Ed25519Signature2018',
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
        created: '2021-11-16T14:52:19.514Z',
        jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..6QqnZoVBfNzNLa6GO8vnLq7YjIxKvL-e1a4NGYFOwjf9GQtJcD6kenu8Sb_DOXERUUYZnVbsaRRrRAIN0YR0DQ',
      },
    },
    {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        {
          Role: 'ctx_role:Role',
          ctx_role: 'https://example.org/ld-context-2022#',
          role: 'ctx_role:role',
        },
      ],
      id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636t',
      type: ['VerifiableCredential', 'Role'],
      credentialSubject: { role: 'admin' },
      issuer: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
      issuanceDate: '2022-03-18T08:57:32.477Z',
      proof: {
        type: 'Ed25519Signature2018',
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
        created: '2021-11-16T14:52:19.514Z',
        jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..nV_x5AKqH9M0u5wsEt1D_DXxYpOzuO_nqDEj-alIzPA5yi8_yWAhKbWPa2r9GoTLPehvZrpgleUDiDj-9_F6Bg',
      },
    },
  ];
}

function getPresentation(): IPresentation {
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiablePresentation'],
    verifiableCredential: [
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          {
            AdminRole: 'ew:AdminRole',
            ew: 'https://energyweb.org/ld-context-2022#',
            role: 'ew:role',
          },
        ],
        id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
        type: ['VerifiableCredential', 'AdminRole'],
        credentialSubject: {
          id: 'did:example:1234567894ad31s12',
          role: 'user',
        },
        issuer: 'did:example:123456789af312312i',
        issuanceDate: '2022-03-18T08:57:32.477Z',
        proof: {
          type: 'Ed25519Signature2018',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
          created: '2021-11-16T14:52:19.514Z',
          jws: 'eyJhbGciOiJFZERTQSIsImtpZCI6InpXTUU5MTNqZFlySUx1WUQtb3QtakRibXpxejM0SHFsQ1VaNkNNZEpueW8iLCJjcml0IjpbImI2NCJdLCJiNjQiOmZhbHNlfQ..b8N7pmZHjWN_QnEdJBXrubP-HOcnkQjkXSUHth6drx3UjEaQpNfGW2lICDWL6qaAcXxcMQX-_GH-8XxtHTdxDQ',
        },
      },
    ],
  };
}

describe('evaluate JGiter tests', () => {
  it('should return v2 in version discovery', function () {
    const pdSchema: PresentationDefinitionV2 = getPresentationDefinition_1();
    const result = PEX.definitionVersionDiscovery(pdSchema);
    expect(result.version).toEqual('v2');
  });

  it('Evaluate case with with original submission requirements', () => {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV2 = getPresentationDefinition_1();
    const vcs = getVerifiableCredentials();

    const selectFrom = pex.selectFrom(pdSchema, vcs);
    expect(selectFrom.errors?.length).toEqual(6);
    expect(selectFrom.areRequiredCredentialsPresent).toEqual(Status.WARN);
    expect(selectFrom.verifiableCredential?.length).toEqual(2);
    expect(selectFrom.matches![0]?.from).toEqual('A');
    expect(selectFrom.matches![0]?.vc_path).toEqual(['$.verifiableCredential[0]']);
    expect(selectFrom.matches![1]?.from).toEqual('B');
    expect(selectFrom.matches![1]?.vc_path).toEqual(['$.verifiableCredential[1]']);
    const presentationResult = pex.presentationFrom(pdSchema, selectFrom.verifiableCredential as IVerifiableCredential[]);
    const presentation = presentationResult.presentation;
    expect(presentation.presentation_submission?.descriptor_map).toEqual([
      {
        id: 'identity_input',
        format: 'ldp_vc',
        path: '$.verifiableCredential[0]',
      },
      {
        id: 'name_input',
        format: 'ldp_vc',
        path: '$.verifiableCredential[0]',
      },
      {
        id: 'role_input',
        format: 'ldp_vc',
        path: '$.verifiableCredential[1]',
      },
    ]);
    const evalResult: EvaluationResults = pex.evaluatePresentation(pdSchema, presentation);
    expect(evalResult.errors?.length).toEqual(0);
  });

  it('Evaluate case with with single submission requirements (A all)', () => {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV2 = getPresentationDefinition_2();
    const vcs = getVerifiableCredentials();
    const selectResult = pex.selectFrom(pdSchema, vcs);
    expect(selectResult.errors?.length).toEqual(6);
    expect(selectResult.areRequiredCredentialsPresent).toEqual(Status.WARN);
  });

  it('Evaluate case with with single submission requirements (A pick min 2)', () => {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV2 = getPresentationDefinition_4();
    const vcs = getVerifiableCredentials();
    const selectResult = pex.selectFrom(pdSchema, vcs);
    const resultEvaluation = pex.evaluateCredentials(pdSchema, [selectResult.verifiableCredential![0], selectResult.verifiableCredential![1]]);
    expect(resultEvaluation.errors?.length).toEqual(0);
    expect(resultEvaluation.areRequiredCredentialsPresent).toEqual(Status.INFO);
    const presentationResult = pex.presentationFrom(pdSchema, [resultEvaluation.verifiableCredential[0]]);
    expect(presentationResult.presentation.presentation_submission?.descriptor_map).toEqual([
      {
        id: 'identity_input',
        format: 'ldp_vc',
        path: '$.verifiableCredential[0]',
      },
      {
        id: 'name_input',
        format: 'ldp_vc',
        path: '$.verifiableCredential[0]',
      },
    ]);
  });

  it('Evaluate case with with single submission requirements (A pick count 3)', () => {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV2 = getPresentationDefinition_5();
    const vcs = getVerifiableCredentials();
    const selectResult = pex.selectFrom(pdSchema, vcs);
    expect(selectResult.areRequiredCredentialsPresent).toBe(Status.ERROR);
  });

  it('Evaluate case with with no submission requirements', () => {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV2 = getPresentationDefinition_3();
    const vcs = getVerifiableCredentials();
    const resultSelectFrom = pex.selectFrom(pdSchema, vcs, {
      holderDIDs: undefined,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(resultSelectFrom.areRequiredCredentialsPresent).toEqual(Status.INFO);
    expect(resultSelectFrom.matches).toEqual([
      {
        name: 'Subject identity input',
        rule: Rules.All,
        vc_path: ['$.verifiableCredential[0]'],
      },
      {
        name: 'Subject name input',
        rule: Rules.All,
        vc_path: ['$.verifiableCredential[0]'],
      },
      {
        name: 'Admin role input',
        rule: Rules.All,
        vc_path: ['$.verifiableCredential[1]'],
      },
    ]);
    expect(resultSelectFrom.verifiableCredential?.length).toEqual(2);
  });

  it('should have 2 errors in the evaluation result', function () {
    const pex: PEX = new PEX();
    const evaluatePresentationResult = pex.evaluatePresentation(getPresentationDefinition_6(), getPresentation(), {
      generatePresentationSubmission: true,
    });
    expect(evaluatePresentationResult.errors?.length).toEqual(2);
  });

  it('should have 2 errors in the evaluation result with passing ID', function () {
    const pex: PEX = new PEX();
    const sd: EvaluationResults = pex.evaluateCredentials(getPresentationDefinition_7(), getPresentation().verifiableCredential!);
    expect(sd.errors?.length).toEqual(2);
    const evaluatePresentationResult = new PEX().evaluatePresentation(getPresentationDefinition_7(), getPresentation(), {
      generatePresentationSubmission: true,
    });
    expect(evaluatePresentationResult.errors?.length).toEqual(2);
  });
});
