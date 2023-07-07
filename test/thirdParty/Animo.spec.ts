import { Rules } from '@sphereon/pex-models';
import { W3CVerifiableCredential } from '@sphereon/ssi-types';

import { IPresentationDefinition, PEX, Status } from '../../lib';

describe('evaluate animo tests', () => {
  it('should pass with 2 VCs and 2 IDs', () => {
    const pex: PEX = new PEX();
    const result = pex.evaluateCredentials(pd, vcs);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
  });

  it('should pass with 2 VCs and 2 IDs with rule all', () => {
    const pex: PEX = new PEX();
    const pdModified = { ...pd };
    pdModified.submission_requirements = [
      {
        rule: Rules.All,
        name: 'animo test All',
        from: 'A',
      },
    ];
    for (const inputDescriptor of pdModified.input_descriptors) {
      inputDescriptor.group = ['A'];
    }
    const result = pex.evaluateCredentials(pdModified, vcs);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
  });

  it('should pass with 2 VCs and 2 IDs with rule pick min 1', () => {
    const pex: PEX = new PEX();
    const pdModified = { ...pd };
    pdModified.submission_requirements = [
      {
        rule: Rules.Pick,
        name: 'animo test Pick',
        from: 'A',
        min: 1,
      },
    ];
    for (const inputDescriptor of pdModified.input_descriptors) {
      inputDescriptor.group = ['A'];
    }

    const result = pex.evaluateCredentials(pdModified, vcs);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
  });

  it('should not pass with 2 VCs and 3 IDs', () => {
    const pex: PEX = new PEX();
    const pdModified = pd;
    pdModified.input_descriptors.push({
      id: 'jf2yccf9-becb-nf4e-0f6d-bvbe152a7fd9',
      purpose: 'You must have a valid Bachelor Degree issued by Sphereon.',
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
              pattern: 'did:web:sphereon',
            },
          },
        ],
      },
    });
    const result = pex.evaluateCredentials(pdModified, vcs);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.ERROR);
  });

  it('should have valid name in matches from SelectResults', function () {
    const pd: IPresentationDefinition = {
      id: '022c2664-68cc-45cc-b291-789ce8b599eb',
      name: 'Presentation Definition',
      purpose: 'We want to know your name and e-mail address (will not be stored)',
      input_descriptors: [
        {
          id: 'c2834d0e-3c95-4721-b21a-40e3d7ea2549',
          purpose: 'To access this portal your DBC Conference 2023 attendance proof is required.',
          group: ['A'],
          schema: [
            {
              uri: 'DBCConferenceAttendee',
              required: true,
            },
          ],
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.event.name', '$.vc.credentialSubject.event.name'],
                filter: {
                  type: 'string',
                  pattern: 'DBC Conference 2023',
                },
              },
            ],
          },
        },
        {
          id: 'c2834d0e-3c95-4721-b21a-40e3d7ea25434',
          purpose: 'To access this portal you need to show your JFF Plugfest OpenBadge credential.',
          group: ['B'],
          schema: [
            {
              uri: 'OpenBadgeCredential',
              required: true,
            },
          ],
        },
      ],
      submission_requirements: [
        {
          rule: 'pick',
          count: 1,
          from: 'A',
        },
        {
          rule: 'pick',
          count: 1,
          from: 'B',
        },
      ],
    };
    const vcs = [
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImRpZDprZXk6ekRuYWVlY3Vacjg2OXZTNTl4R1BSTmRTTnFEVHBvc2pTWlVqQ1E3c1RoUkExeDRDNyN6RG5hZWVjdVpyODY5dlM1OXhHUFJOZFNOcURUcG9zalNaVWpDUTdzVGhSQTF4NEM3In0.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiREJDQ29uZmVyZW5jZUF0dGVuZGVlIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImZpcnN0TmFtZSI6IkphbiIsImxhc3ROYW1lIjoiUmlldHZlbGQiLCJlbWFpbCI6ImphbkBhbmltby5pZCIsImV2ZW50Ijp7Im5hbWUiOiJEQkMgQ29uZmVyZW5jZSAyMDIzIiwiZGF0ZSI6IjIwMjMtMDYtMjYifX19LCJpc3MiOiJkaWQ6a2V5OnpEbmFlZWN1WnI4Njl2UzU5eEdQUk5kU05xRFRwb3NqU1pVakNRN3NUaFJBMXg0QzciLCJzdWIiOiJkaWQ6andrOmV5SmpjbllpT2lKUUxUSTFOaUlzSW10MGVTSTZJa1ZESWl3aWVDSTZJbUZqWWtsUmFYVk5jek5wT0Y5MWMzcEZha295ZEhCVWRGSk5ORVZWTTNsNk9URlFTRFpEWkVneVZqQWlMQ0o1SWpvaVgwdGplVXhxT1haWFRYQjBibTFMZEcwME5rZHhSSG80ZDJZM05FazFURXRuY213eVIzcElNMjVUUlNKOSIsIm5iZiI6MTY4NTQ0ODAwMH0.GpNndHFkLQlR7wtl4loorizB7jCXArv6YIPW5ckmFP92BXHd4o_bX13osah_3o2iqjN7SWjwex_L3COmB02ysg',
      'eyJraWQiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0oxYzJVaU9pSnphV2NpTENKamNuWWlPaUpGWkRJMU5URTVJaXdpYTJsa0lqb2lOMlEyWTJKbU1qUTRPV0l6TkRJM05tSXhOekl4T1RBMU5EbGtNak01TVRnaUxDSjRJam9pUm01RlZWVmhkV1J0T1RsT016QmlPREJxY3poV2REUkJiazk0ZGxKM1dIUm5VbU5MY1ROblFrbDFPQ0lzSW1Gc1p5STZJa1ZrUkZOQkluMCMwIiwidHlwIjoiSldUIiwiYWxnIjoiRWREU0EifQ.eyJpc3MiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0oxYzJVaU9pSnphV2NpTENKamNuWWlPaUpGWkRJMU5URTVJaXdpYTJsa0lqb2lOMlEyWTJKbU1qUTRPV0l6TkRJM05tSXhOekl4T1RBMU5EbGtNak01TVRnaUxDSjRJam9pUm01RlZWVmhkV1J0T1RsT016QmlPREJxY3poV2REUkJiazk0ZGxKM1dIUm5VbU5MY1ROblFrbDFPQ0lzSW1Gc1p5STZJa1ZrUkZOQkluMCIsInN1YiI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpQUzFBaUxDSmpjbllpT2lKRlpESTFOVEU1SWl3aWVDSTZJbHBoYVRoNlNHWXdUVU5MY0dkTE9IbHhkMVZoTjA5ak5XSlBhV3h0UWpRMGRFUnlZamRPVVRCMlowa2lmUSIsIm5iZiI6MTY4NjA0NjE4OSwiaWF0IjoxNjg2MDQ2MTg5LCJ2YyI6eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiT3BlbkJhZGdlQ3JlZGVudGlhbCJdLCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vcHVybC5pbXNnbG9iYWwub3JnL3NwZWMvb2IvdjNwMC9jb250ZXh0Lmpzb24iXSwiaWQiOiJ1cm46dXVpZDpiMDczNmEwMy0wYmVjLTQ2YTYtOTFkYS0zMmFlNWRmYmYxNTYiLCJpc3N1ZXIiOnsiaWQiOiJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0oxYzJVaU9pSnphV2NpTENKamNuWWlPaUpGWkRJMU5URTVJaXdpYTJsa0lqb2lOMlEyWTJKbU1qUTRPV0l6TkRJM05tSXhOekl4T1RBMU5EbGtNak01TVRnaUxDSjRJam9pUm01RlZWVmhkV1J0T1RsT016QmlPREJxY3poV2REUkJiazk0ZGxKM1dIUm5VbU5MY1ROblFrbDFPQ0lzSW1Gc1p5STZJa1ZrUkZOQkluMCIsImltYWdlIjp7ImlkIjoiaHR0cHM6Ly93M2MtY2NnLmdpdGh1Yi5pby92Yy1lZC9wbHVnZmVzdC0yLTIwMjIvaW1hZ2VzL0pGRi1WQy1FRFUtUExVR0ZFU1QyLWJhZGdlLWltYWdlLnBuZyIsInR5cGUiOiJJbWFnZSJ9LCJuYW1lIjoiSm9icyBmb3IgdGhlIEZ1dHVyZSAoSkZGKSIsInR5cGUiOiJQcm9maWxlIiwidXJsIjoiaHR0cHM6Ly93M2MtY2NnLmdpdGh1Yi5pby92Yy1lZC9wbHVnZmVzdC0yLTIwMjIvaW1hZ2VzL0pGRi1WQy1FRFUtUExVR0ZFU1QyLWJhZGdlLWltYWdlLnBuZyJ9LCJpc3N1YW5jZURhdGUiOiIyMDIzLTA2LTA2VDEwOjA5OjQ5WiIsImlzc3VlZCI6IjIwMjMtMDYtMDZUMTA6MDk6NDlaIiwidmFsaWRGcm9tIjoiMjAyMy0wNi0wNlQxMDowOTo0OVoiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpQUzFBaUxDSmpjbllpT2lKRlpESTFOVEU1SWl3aWVDSTZJbHBoYVRoNlNHWXdUVU5MY0dkTE9IbHhkMVZoTjA5ak5XSlBhV3h0UWpRMGRFUnlZamRPVVRCMlowa2lmUSIsImFjaGlldmVtZW50Ijp7ImNyaXRlcmlhIjp7Im5hcnJhdGl2ZSI6IlRoZSBjb2hvcnQgb2YgdGhlIEpGRiBQbHVnZmVzdCAyIGluIEF1Z3VzdC1Ob3ZlbWJlciBvZiAyMDIyIGNvbGxhYm9yYXRlZCB0byBwdXNoIGludGVyb3BlcmFiaWxpdHkgb2YgVkNzIGluIGVkdWNhdGlvbiBmb3J3YXJkLiIsInR5cGUiOiJDcml0ZXJpYSJ9LCJkZXNjcmlwdGlvbiI6IlRoaXMgd2FsbGV0IGNhbiBkaXNwbGF5IHRoaXMgT3BlbiBCYWRnZSAzLjAiLCJpZCI6IjAiLCJpbWFnZSI6eyJpZCI6Imh0dHBzOi8vdzNjLWNjZy5naXRodWIuaW8vdmMtZWQvcGx1Z2Zlc3QtMi0yMDIyL2ltYWdlcy9KRkYtVkMtRURVLVBMVUdGRVNUMi1iYWRnZS1pbWFnZS5wbmciLCJ0eXBlIjoiSW1hZ2UifSwibmFtZSI6Ik91ciBXYWxsZXQgUGFzc2VkIEpGRiBQbHVnZmVzdCAjMiAyMDIyIiwidHlwZSI6IkFjaGlldmVtZW50In0sInR5cGUiOiJBY2hpZXZlbWVudFN1YmplY3QifSwibmFtZSI6IkFjaGlldmVtZW50IENyZWRlbnRpYWwifSwianRpIjoidXJuOnV1aWQ6YjA3MzZhMDMtMGJlYy00NmE2LTkxZGEtMzJhZTVkZmJmMTU2In0.M7m5_E1hcCp13x4zWqZA6dASMh9sfNB9sr8Dwtm40vdQtPFyJ5PFESzPLhfv0kzyFAe3f_KMqZIbU7VKpsKACw',
    ];
    const pex: PEX = new PEX();
    const result = pex.selectFrom(pd, vcs);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
    expect(result.matches?.length).toEqual(2);
    expect(new Set(result.matches?.map((value) => value.name)).size).toEqual(2);
    expect(result.matches?.map((value) => value.name).indexOf('c2834d0e-3c95-4721-b21a-40e3d7ea2549')).toBeGreaterThanOrEqual(0);
    expect(result.matches?.map((value) => value.name).indexOf('c2834d0e-3c95-4721-b21a-40e3d7ea25434')).toBeGreaterThanOrEqual(0);
  });

  const vcs: W3CVerifiableCredential[] = [
    {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
      id: 'http://example.gov/credentials/3732',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      issuer: 'did:web:vc.transmute.world',
      issuanceDate: '2020-03-16T22:37:26.544Z',
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
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v2'],
      id: 'http://example.gov/credentials/1231231',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      issuer: 'did:web:animo.id',
      issuanceDate: '2020-03-16T22:37:26.544Z',
      credentialSubject: {
        id: 'did:key:z6MkjRagNiMu91DduvCvgEsqLZDVzrJzFrwahc4tXLt9DoHd',
        degree: {
          type: 'BachelorDegree',
          name: 'Bachelor of Fights',
        },
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2020-04-02T18:28:08Z',
        verificationMethod: 'did:web:animo.id#z6MksHh7qHWvybLg5QTPPdG2DgEjjduBDArV9EF9mRiRzMBN',
        proofPurpose: 'assertionMethod',
        jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YtqjEYnFENT7fNW-COD0HAACxeuQxPKAmp4nIl8jYAu__6IH2FpSxv81w-l5PvE1og50tS9tH8WyXMlXyo45CA',
      },
    },
  ];
  const pd: IPresentationDefinition = {
    id: '31e2f0f1-6b70-411d-b239-56aed5321884',
    purpose: 'To check if you have a valid college degree.',
    input_descriptors: [
      {
        id: 'df2accf9-1ecb-4f4e-af6d-21be152a881b',
        purpose: 'You must have a valid Bachelor Degree issued by Animo.',
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
                pattern: 'did:web:animo.id',
              },
            },
          ],
        },
      },
      {
        id: '867bfe7a-5b91-46b2-9ba4-70028b8d9cc8',
        purpose: 'You must have a valid Bachelor Degree issued by Transmute.',
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
    ],
  };
});
