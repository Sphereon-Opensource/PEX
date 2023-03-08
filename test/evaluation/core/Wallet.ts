import { IVerifiableCredential } from '@sphereon/ssi-types';

export class Wallet {
  getWallet(): { holder: string; verifiableCredentials: IVerifiableCredential[] } {
    // We can't force our users to give us a complete VerifiableCredentialJsonLd/VerifiableCredentialJwt so we can get it like this
    const vc0: IVerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3c-ccg.github.io/vc-examples/covid-19/v2/v2.jsonld'],
      id: 'http://example.com/credential/123',
      type: ['VerifiableCredential', 'qSARS-CoV-2-Rapid-Test-Credential'],
      description:
        'Results from antibody testing should not be used as the sole' +
        ' basis to diagnose or exclude SARS-CoV-2 infection. False positive results may occur due to cross-reacting' +
        ' antibodies from previous infections, such as other coronaviruses, or from other causes Samples with positive' +
        ' results should be confirmed with alternative testing method(s) and clinical findings before a diagnostic' +
        ' determination is made.',
      name: 'qSARS-CoV-2 IgG/IgM Rapid Test Credential',
      issuanceDate: '2019-12-11T03:50:55Z',
      expirationDate: '2020-12-11T03:50:55Z',
      issuer: {
        id: 'did:elem:ropsten:EiBJJPdo-ONF0jxqt8mZYEj9Z7FbdC87m2xvN0_HAbcoEg',
        location: {
          '@type': 'CovidTestingFacility',
          name: 'Stanford Health Care',
          url: 'https://stanfordhealthcare.org/',
        },
      },
      credentialSubject: {
        id: 'did:key:z6MkjRagNiMu91DduvCvgEsqLZDVzrJzFrwahc4tXLt9DoHd',
        type: ['qSARS-CoV-2-Rapid-Test-Credential'],
        catalogNumber: '5515C025, 5515C050, 5515C100',
        ifu: 'https://cellexcovid.com/wp-content/uploads/2020/04/Cellex-rapid-ifu.pdf',
        assay: 'Negative',
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2020-04-18T18:35:13Z',
        verificationMethod: 'did:elem:ropsten:EiBJJPdo-ONF0jxqt8mZYEj9Z7FbdC87m2xvN0_HAbcoEg#xqc3gS1gz1vch7R3RvNebWMjLvBOY-n_14feCYRPsUo',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..xnB7m8M6TcAFmz2efqb74IyJECUTAMpCkJAudfmVkLC3CPmCrMznvlD2E7WCCkzF9nnrZlJw0VpHdXJpjEU-AQ',
      },
    };
    const vc1: IVerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/security/suites/ed25519-2020/v1', 'https://w3id.org/citizenship/v1'],
      id: 'https://issuer.oidp.uscis.gov/credentials/83627465',
      type: ['VerifiableCredential', 'PermanentResidentCard'],
      description: 'Government of Example Permanent Resident Card.',
      expirationDate: '2029-12-03T12:19:52Z',
      identifier: '83627465',
      issuanceDate: '2019-12-03T12:19:52Z',
      issuer: 'did:key:z6MkuDyqwjCVhFFQEZdS5utguwYD2KRig2PEb9qbfP9iqwn9',
      name: 'Permanent Resident Card',
      credentialSubject: {
        birthCountry: 'Bahamas',
        birthDate: '1958-07-17',
        commuterClassification: 'C1',
        familyName: 'SMITH',
        gender: 'Female',
        givenName: 'ALICE',
        id: 'did:example:b34ca6cd37bbf23',
        image: 'data:image/png;base64,iVBORw0KGgokJggg==',
        lprCategory: 'C09',
        lprNumber: '999-999-999',
        residentSince: '2015-01-01',
        type: ['PermanentResident', 'Person'],
      },
      proof: {
        created: '2021-09-21T19:18:08Z',
        proofPurpose: 'assertionMethod',
        proofValue: 'z22TFxZwpiT3B7TEKTZNyRzYbf6GfrXo7Xv35nyJTH6xWkvQAAiRCdnjAg4tRA5qB3bA9zZ726CthFUQf8Y8f3p1R',
        type: 'Ed25519Signature2020',
        verificationMethod: 'did:key:z6MkuDyqwjCVhFFQEZdS5utguwYD2KRig2PEb9qbfP9iqwn9#key-1',
        //it was missing in the original vc
        jws: '',
      },
    };
    const vc2: IVerifiableCredential = {
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
    };
    return {
      holder: 'did:key:z6MkjRagNiMu91DduvCvgEsqLZDVzrJzFrwahc4tXLt9DoHd',
      verifiableCredentials: [vc0, vc1, vc2],
    };
  }
}
