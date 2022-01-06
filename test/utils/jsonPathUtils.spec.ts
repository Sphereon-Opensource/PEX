import { FilterV1, PresentationDefinitionV1 } from '@sphereon/pex-models';

import { JsonPathUtils } from '../../lib/utils';

function getPresentationDefinitionV1(): PresentationDefinitionV1 {
    return {
      id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      name: 'Conference Entry Requirements',
      purpose: 'We can only allow people associated with Washington State business representatives into conference areas',
      input_descriptors: [
        {
        schema: [
                {
                  "uri": "https://licenses.example.com/business-license.json"
                }
              ],
          id: 'wa_driver_license',
          name: 'Washington State Business License',
          purpose: 'We can only allow licensed Washington State business representatives into the WA Business Conference',
          constraints: {
            limit_disclosure: 'required',
            fields: [
              {
                path: ['$.issuer', '$.vc.issuer', '$.iss'],
                purpose:
                  'We can only verify bank accounts if they are attested by a trusted bank, auditor, or regulatory authority.',
                filter: {
                  type: 'string',
                  _const: 'did:example:123|did:example:456',
                },
              },
            ],
          },
        },
      ]
    };
  }
  
describe('should test jsonPathUtils function', () => {
  it('should return ok if changePropertyNameRecursively works correctly', () => {
    const pdSchema: PresentationDefinitionV1 = getPresentationDefinitionV1();
    JsonPathUtils.changePropertyNameRecursively(pdSchema, '_const', 'const');
    expect(pdSchema.input_descriptors![0].constraints!.fields![0].filter!['const' as keyof FilterV1]).toEqual('did:example:123|did:example:456');
  });
});
