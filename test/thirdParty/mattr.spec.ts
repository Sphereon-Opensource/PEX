import { W3CVerifiableCredential } from '@sphereon/ssi-types';

import { IPresentationDefinition, PEX, Status } from '../../lib';

describe('evaluate mattr tests', () => {
  it('should validate mattr presentation definition', () => {
    const validated = PEX.validateDefinition(pd);

    expect(validated).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('should pass with OpenBadgeCredential but as jwt_vc whilst descriptor wants jwt_json', () => {
    const pex: PEX = new PEX();
    const result = pex.evaluateCredentials(pd, vcs);
    console.log(JSON.stringify(result, null, 2));
    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
  });

  it('should not pass when contains is not OpenBadgeCredential type', () => {
    const pex: PEX = new PEX();

    const newPd = {
      ...pd,
      input_descriptors: [
        {
          ...pd.input_descriptors[0],
          constraints: {
            ...pd.input_descriptors[0].constraints,
            fields: [
              {
                ...pd.input_descriptors[0].constraints.fields[0],
                filter: {
                  ...pd.input_descriptors[0].constraints.fields[0].filter,
                  contains: {
                    ...pd.input_descriptors[0].constraints.fields[0].filter.contains,
                    const: 'NotOpenBadgeCredential',
                  },
                },
              },
            ],
          },
        },
      ],
    };

    const result = pex.evaluateCredentials(newPd, vcs);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.ERROR);
  });

  const vcs: W3CVerifiableCredential[] = [
    'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDp3ZWI6bGF1bmNocGFkLnZpaS5lbGVjdHJvbi5tYXR0cmxhYnMuaW8jNkJoRk1DR1RKZyJ9.eyJpc3MiOiJkaWQ6d2ViOmxhdW5jaHBhZC52aWkuZWxlY3Ryb24ubWF0dHJsYWJzLmlvIiwic3ViIjoiZGlkOmtleTp6Nk1raHpBUWpvVW1KQ21WVVFxMkJYQVVkWkJ1a3AxQXpYNGc5U0VOVUROWG9FRzEiLCJuYmYiOjE2OTU3MTk5MjksImV4cCI6MTcyNzM0MjMyOSwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJodHRwczovL21hdHRyLmdsb2JhbC9jb250ZXh0cy92Yy1leHRlbnNpb25zL3YyIiwiaHR0cHM6Ly9wdXJsLmltc2dsb2JhbC5vcmcvc3BlYy9vYi92M3AwL2NvbnRleHQtMy4wLjIuanNvbiIsImh0dHBzOi8vcHVybC5pbXNnbG9iYWwub3JnL3NwZWMvb2IvdjNwMC9leHRlbnNpb25zLmpzb24iLCJodHRwczovL3czaWQub3JnL3ZjLXJldm9jYXRpb24tbGlzdC0yMDIwL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJPcGVuQmFkZ2VDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiZGlkOmtleTp6Nk1raHpBUWpvVW1KQ21WVVFxMkJYQVVkWkJ1a3AxQXpYNGc5U0VOVUROWG9FRzEiLCJ0eXBlIjpbIkFjaGlldmVtZW50U3ViamVjdCJdLCJhY2hpZXZlbWVudCI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vYWNoaWV2ZW1lbnRzLzIxc3QtY2VudHVyeS1za2lsbHMvdGVhbXdvcmsiLCJuYW1lIjoiVGVhbXdvcmsiLCJ0eXBlIjpbIkFjaGlldmVtZW50Il0sImltYWdlIjp7ImlkIjoiaHR0cHM6Ly93M2MtY2NnLmdpdGh1Yi5pby92Yy1lZC9wbHVnZmVzdC0zLTIwMjMvaW1hZ2VzL0pGRi1WQy1FRFUtUExVR0ZFU1QzLWJhZGdlLWltYWdlLnBuZyIsInR5cGUiOiJJbWFnZSJ9LCJjcml0ZXJpYSI6eyJuYXJyYXRpdmUiOiJUZWFtIG1lbWJlcnMgYXJlIG5vbWluYXRlZCBmb3IgdGhpcyBiYWRnZSBieSB0aGVpciBwZWVycyBhbmQgcmVjb2duaXplZCB1cG9uIHJldmlldyBieSBFeGFtcGxlIENvcnAgbWFuYWdlbWVudC4ifSwiZGVzY3JpcHRpb24iOiJUaGlzIGJhZGdlIHJlY29nbml6ZXMgdGhlIGRldmVsb3BtZW50IG9mIHRoZSBjYXBhY2l0eSB0byBjb2xsYWJvcmF0ZSB3aXRoaW4gYSBncm91cCBlbnZpcm9ubWVudC4ifX0sImlzc3VlciI6eyJpZCI6ImRpZDp3ZWI6bGF1bmNocGFkLnZpaS5lbGVjdHJvbi5tYXR0cmxhYnMuaW8iLCJuYW1lIjoiRXhhbXBsZSBVbml2ZXJzaXR5IiwiaWNvblVybCI6Imh0dHBzOi8vdzNjLWNjZy5naXRodWIuaW8vdmMtZWQvcGx1Z2Zlc3QtMS0yMDIyL2ltYWdlcy9KRkZfTG9nb0xvY2t1cC5wbmciLCJpbWFnZSI6Imh0dHBzOi8vdzNjLWNjZy5naXRodWIuaW8vdmMtZWQvcGx1Z2Zlc3QtMS0yMDIyL2ltYWdlcy9KRkZfTG9nb0xvY2t1cC5wbmcifX19.098G6WqIsCT2Sc4X3ioa8g_g382bknK-13_vhYHKa4w43e10RPhlg8-0Ir5roYnaYvoXIEW7pUAB-d5KJiO2AA',
  ];

  const pd = {
    id: '401f3844-e4f4-4031-897a-ca3e1f07d98b',
    input_descriptors: [
      {
        id: 'OpenBadgeCredential',
        format: { jwt_vc_json: { alg: ['EdDSA'] }, jwt_vc: { alg: ['EdDSA'] } },
        constraints: {
          fields: [
            {
              path: ['$.vc.type'],
              filter: {
                type: 'array',
                items: { type: 'string' },
                contains: { const: 'OpenBadgeCredential' },
              },
            },
          ],
        },
      },
    ],
  } satisfies IPresentationDefinition;
});
