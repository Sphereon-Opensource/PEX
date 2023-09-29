import { PEX } from '../../lib';

describe('evaluate animo tests', () => {
  it('should validate mattr presentation definition', () => {
    const validated = PEX.validateDefinition({
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
                  // FIXME: need to wait for new release of @sphereon/pex-models
                  // @ts-ignore
                  items: { type: 'string' },
                  contains: { const: 'OpenBadgeCredential' },
                },
              },
            ],
          },
        },
      ],
    });

    expect(validated).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });
});
