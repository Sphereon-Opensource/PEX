import { FilterV1, PresentationDefinitionV1, PresentationDefinitionV2 } from '@sphereon/pex-models';

import { SSITypesBuilder } from '../../lib/types/SSITypesBuilder';
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
            uri: 'https://licenses.example.com/business-license.json',
          },
        ],
        id: 'wa_driver_license',
        name: 'Washington State Business License',
        purpose: 'We can only allow licensed Washington State business representatives into the WA Business Conference',
        constraints: {
          limit_disclosure: 'required',
          fields: [
            {
              path: ['$.issuer', '$.vc.issuer', '$.iss'],
              purpose: 'We can only verify bank accounts if they are attested by a trusted bank, auditor, or regulatory authority.',
              filter: {
                type: 'string',
                const: 'did:example:123|did:example:456',
              },
            },
          ],
        },
      },
    ],
  };
}

describe('should test jsonPathUtils function', () => {
  it('should return ok if changePropertyNameRecursively works correctly', () => {
    const pdSchema: PresentationDefinitionV1 = getPresentationDefinitionV1();
    JsonPathUtils.changePropertyNameRecursively(pdSchema, '_const', 'const');
    expect(pdSchema.input_descriptors![0].constraints!.fields![0].filter!['const' as keyof FilterV1]).toEqual('did:example:123|did:example:456');
  });

  it('should return ok if presentation definition @ in path escapes first and not second', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV1();
    pd.input_descriptors[0].constraints!.fields = [
      {
        path: ['$.@book.accessModeSufficient[(@.length-1)]'],
        purpose: 'We only want books which have the certain access mode.',
        filter: {
          type: 'string',
          const: 'auditory',
        },
      },
    ];
    const result = SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(pd);
    expect(result.input_descriptors[0].constraints!.fields![0].path).toEqual(["$['@book'].accessModeSufficient[(@.length-1)]"]);
  });

  it('should return ok if presentation definition @ in path escapes properly', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV1();
    pd.input_descriptors[0].constraints!.fields = [
      {
        path: ["$..['@context']", "$.vc..['@context']"],
        purpose: 'We can only verify driver licensed if they have a certain context',
        filter: {
          type: 'string',
          const: 'https://eu.com/claims/DriversLicense',
        },
      },
    ];
    const result = SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(pd);
    expect(result.input_descriptors[0].constraints!.fields![0].path).toEqual(["$..['@context']", "$.vc..['@context']"]);
  });

  it('should return ok if presentation definition @ in path works properly - 1', () => {
    const pd: PresentationDefinitionV1 = getPresentationDefinitionV1();
    pd.input_descriptors[0].constraints!.fields = [
      {
        path: ['$.@context', '$.vc.@context'],
        purpose: 'We can only verify driver licensed if they have a certain context.',
        filter: {
          type: 'string',
          const: 'https://eu.com/claims/DriversLicense',
        },
      },
    ];
    const result = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pd);
    expect(result.input_descriptors[0].constraints!.fields![0].path).toEqual(["$['@context']", "$.vc['@context']"]);
  });

  it('should return ok if presentation definition @ in path works properly - 2', () => {
    const pd: PresentationDefinitionV1 = getPresentationDefinitionV1();
    pd.input_descriptors[0].constraints!.fields = [
      {
        path: ['$@context'],
        purpose: 'We can only verify driver licensed if they have a certain context.',
        filter: {
          type: 'string',
          const: 'https://eu.com/claims/DriversLicense',
        },
      },
    ];
    const result = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pd);
    expect(result.input_descriptors[0].constraints!.fields![0].path).toEqual(["$['@context']"]);
  });

  it("other valid paths in json-ld shouldn't be affected by regex subs", () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV1();
    pd.input_descriptors[0].constraints!.fields = [
      {
        path: ['$..book[(@.length-1)]', '$..book[?(@.price<30 && @.category=="fiction")]', '$..book[?(@.price==8.95)]'],
        purpose: 'We only want books which have the category fiction and their price is 8.95.',
        filter: {
          type: 'string',
          const: 'https://schema.org/Book',
        },
      },
    ];
    const result = SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(pd);
    expect(result.input_descriptors[0].constraints!.fields![0].path).toEqual(pd.input_descriptors[0].constraints!.fields[0].path);
  });
});
