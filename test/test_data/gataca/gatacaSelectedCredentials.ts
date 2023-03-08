import { IVerifiableCredential } from '@sphereon/ssi-types';

export class GatacaSelectedCredentials {
  static getVerifiableCredentials(): IVerifiableCredential[] {
    return [
      {
        id: 'cred:gatc:ZTQ3Y2EyZGFkZTdlMGM5ODRiZjFjOTcw',
        type: ['VerifiableCredential', 'emailCredential'],
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
        issuer: 'did:gatc:acYseLtTEVeqF8oBhJEejbCVHJ8auVupaRuo6gw4hmXjcc77uCKqyM3imEJH',
        issuanceDate: '2021-11-26T13:19:20.000Z',
        credentialSubject: {
          email: 'jose@gataca.io',
          id: 'did:gatc:YzQxNjRjM2U4YTUzZGVkNjhmNjAxYzk5',
        },
        credentialStatus: undefined,
        credentialSchema: undefined,
        proof: [
          {
            created: '2021-11-26T13:18:27Z',
            creator: 'did:gatc:24gsRbsURij3edoveHv81jt9EnhggrnR#keys-1',
            domain: 'gataca.io',
            nonce: 'CTVGGQJoCOvyCVi_SDQNXkHeQHvtk82IntgNNvjEB1A=',
            proofPurpose: 'assertionMethod',
            signatureValue: 'rB5FsoYnYR6M69lNMafDXoHdhUQEpA156y_D1ohVLxmhEmJswyyVUPVAZoPNsXshed7PXcp0mh27l18Mya9NDA',
            type: 'JcsEd25519Signature2020',
            verificationMethod: 'did:gatc:24gsRbsURij3edoveHv81jt9EnhggrnR#keys-1',
          },
        ],
      },
      {
        id: 'urn:credential:hEoISQtpfXua6VWzbGUKdON1rqxF3liv',
        type: ['VerifiableCredential', 'transcriptOfRecordsCredential'],
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://s3.eu-west-1.amazonaws.com/gataca.io/contexts/v1.json'],
        issuer: 'did:gatc:2wihrrZCM5XWpFkkPLUABXSKP7pniNJ1',
        issuanceDate: '2021-12-03T12:39:04.000Z',
        credentialSubject: {
          achieved: {
            hasPart: {
              learningAchievement: [
                {
                  id: 'urn:epass:learningAchievement:1bT69e7xs8L4wAIFlUZiVrKjpgD0ztm5',
                  specifiedBy: {
                    id: 'urn:epass:qualification:2',
                    title: 'Advanced Time Series Analysis',
                    volumeOfLearning: '6',
                  },
                  title: 'Advanced Time Series Analysis',
                  wasDerivedFrom: {
                    grade: '18',
                    id: 'urn:epass:assessment:2',
                    title: 'Advanced Time Series Analysis',
                  },
                },
                {
                  id: 'urn:epass:learningAchievement:hFm0pLoGlan7AqzOJiycMHbX16rYNTRE',
                  specifiedBy: {
                    id: 'urn:epass:qualification:3',
                    title: 'Generalized Linear Models',
                    volumeOfLearning: '6',
                  },
                  title: 'Generalized Linear Models',
                  wasDerivedFrom: {
                    grade: '15',
                    id: 'urn:epass:assessment:3',
                    title: 'Generalized Linear Models',
                  },
                },
              ],
            },
            id: 'urn:epass:learningAchievement:RfnCAc0zo8p36VNG4PeKTE7LhHjMIFbx',
            identifier: {
              schemeID: 'Certificate ID',
              value: '51016837',
            },
            title: 'Master of Statistics and Data Science',
          },
          id: 'did:gatc:YzQxNjRjM2U4YTUzZGVkNjhmNjAxYzk5',
          identifier: {
            schemeID: 'Student identification number',
            value: 99201234,
          },
        },
        credentialStatus: {
          id: 'https://icts-q-devops-gataca-certify.cloud.q.icts.kuleuven.be/api/v1/group/9016b9ec-8dae-4d57-9acb-fa90888fc6b4/status',
          type: 'CredentialStatusList2017',
        },
        proof: [
          {
            created: '2021-12-03T12:39:04Z',
            creator: 'did:gatc:2wihrrZCM5XWpFkkPLUABXSKP7pniNJ1#keys-1',
            domain: 'gataca.io',
            nonce: '7yx6qOCnemysuuEgD4P9VRnEsw89WkKTcOEM0-uINTs=',
            proofPurpose: 'assertionMethod',
            signatureValue: 'gXdaXrNedX92NNnKqQb7x-08_dKu59dzhTp3NPgLGOIImbMrvd6jVtvXJBhaX1_NRr4W1Od5L9kNudFyZdSDDA',
            type: 'JcsEd25519Signature2020',
            verificationMethod: 'did:gatc:2wihrrZCM5XWpFkkPLUABXSKP7pniNJ1#keys-1',
          },
        ],
      },
    ];
  }

  static getVerifiableCredentials1(): IVerifiableCredential[] {
    return [
      {
        id: 'cred:gatc:NjMxNjc0NTA0ZjVmZmYwY2U0Y2M3NTRk',
        type: ['VerifiableCredential', 'emailCredential'],
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
        issuer: 'did:gatc:24gsRbsURij3edoveHv81jt9EnhggrnR',
        issuanceDate: '2022-01-07T11:54:12.000Z',
        credentialSubject: {
          email: 'jose@gataca.io',
          id: 'did:gatc:YzQxNjRjM2U4YTUzZGVkNjhmNjAxYzk5',
        },
        credentialStatus: {
          id: 'https://backbone.gataca.io/api/v1/group/otp/status',
          type: 'CredentialStatusList2017',
        },
        credentialSchema: [],
        proof: [
          {
            created: '2022-01-07T11:53:21Z',
            creator: 'did:gatc:24gsRbsURij3edoveHv81jt9EnhggrnR#keys-1',
            domain: 'gataca.io',
            nonce: 'sUzybVzzg1ZXFw-xDqSeMP3-TiZqKOtxszk0K4Ag5X8=',
            proofPurpose: 'assertionMethod',
            signatureValue: 'qGIh5JLxollEek5l1yFUcwmHj2H1ZYn3PR8uTa5bDtIcpW6MKKJDpc5_YQjqHGVUKbre8EMDI7e07lgR1ZJ9Bg',
            type: 'JcsEd25519Signature2020',
            verificationMethod: 'did:gatc:24gsRbsURij3edoveHv81jt9EnhggrnR#keys-1',
          },
        ],
      },
      {
        id: 'urn:credential:hEoISQtpfXua6VWzbGUKdON1rqxF3liv',
        type: ['VerifiableCredential', 'transcriptOfRecordsCredential'],
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://s3.eu-west-1.amazonaws.com/gataca.io/contexts/v1.json'],
        issuer: 'did:gatc:2wihrrZCM5XWpFkkPLUABXSKP7pniNJ1',
        issuanceDate: '2021-12-03T12:39:04.000Z',
        credentialSubject: {
          achieved: {
            hasPart: {
              learningAchievement: [
                {
                  id: 'urn:epass:learningAchievement:1bT69e7xs8L4wAIFlUZiVrKjpgD0ztm5',
                  specifiedBy: {
                    id: 'urn:epass:qualification:2',
                    title: 'Advanced Time Series Analysis',
                    volumeOfLearning: '6',
                  },
                  title: 'Advanced Time Series Analysis',
                  wasDerivedFrom: {
                    grade: '18',
                    id: 'urn:epass:assessment:2',
                    title: 'Advanced Time Series Analysis',
                  },
                },
                {
                  id: 'urn:epass:learningAchievement:hFm0pLoGlan7AqzOJiycMHbX16rYNTRE',
                  specifiedBy: {
                    id: 'urn:epass:qualification:3',
                    title: 'Generalized Linear Models',
                    volumeOfLearning: '6',
                  },
                  title: 'Generalized Linear Models',
                  wasDerivedFrom: {
                    grade: '15',
                    id: 'urn:epass:assessment:3',
                    title: 'Generalized Linear Models',
                  },
                },
              ],
            },
            id: 'urn:epass:learningAchievement:RfnCAc0zo8p36VNG4PeKTE7LhHjMIFbx',
            identifier: {
              schemeID: 'Certificate ID',
              value: '51016837',
            },
            title: 'Master of Statistics and Data Science',
          },
          id: 'did:gatc:YzQxNjRjM2U4YTUzZGVkNjhmNjAxYzk5',
          identifier: {
            schemeID: 'Student identification number',
            value: 99201234,
          },
        },
        credentialStatus: {
          id: 'https://icts-q-devops-gataca-certify.cloud.q.icts.kuleuven.be/api/v1/group/9016b9ec-8dae-4d57-9acb-fa90888fc6b4/status',
          type: 'CredentialStatusList2017',
        },
        credentialSchema: [],
        proof: [
          {
            created: '2021-12-03T12:39:04Z',
            creator: 'did:gatc:2wihrrZCM5XWpFkkPLUABXSKP7pniNJ1#keys-1',
            domain: 'gataca.io',
            nonce: '7yx6qOCnemysuuEgD4P9VRnEsw89WkKTcOEM0-uINTs=',
            proofPurpose: 'assertionMethod',
            signatureValue: 'gXdaXrNedX92NNnKqQb7x-08_dKu59dzhTp3NPgLGOIImbMrvd6jVtvXJBhaX1_NRr4W1Od5L9kNudFyZdSDDA',
            type: 'JcsEd25519Signature2020',
            verificationMethod: 'did:gatc:2wihrrZCM5XWpFkkPLUABXSKP7pniNJ1#keys-1',
          },
        ],
      },
    ];
  }
}
