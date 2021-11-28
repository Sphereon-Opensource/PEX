/* eslint-disable @typescript-eslint/no-explicit-any */
import jp from 'jsonpath';

import { InputFieldType } from '../types/SSI.types';

export class JsonPathUtils {
  /**
   * @param verifiableCredential: a vc object can be found in types.verifiableCredential[i]
   * @param paths: paths that can be found in Field object
   * @return a result object containing value of the correct path in the verifiableCredential and the correct path
   * @example(success result): if you call this method with 1. verifiableCredential:
   *   {
        '@context': [''],
        age: 19,
        credentialSchema: [ { id: '' } ],
        id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
        issuer: '',
        type: 'VerifiableCredential'
      }
   and 2 paths: [ '$.age', '$.details.age ]
   you will get result: [ { value: 19, path: [ '$', 'age' ] } ]

   @example(fail result): if you call this method with 1. verifiableCredential:
   {
        '@context': [ '' ],
        credentialSchema: [ { id: '' } ],
        id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
        issuer: '',
        type: 'VerifiableCredential'
      }
   and 2. paths: [ '$.age' ],
   you will get result: result: []
   @example (array example):
   vc: {
        '@context': [''],
        "details": {
        "information":[
          {
            "age": 19
          }]
      },
        credentialSchema: [ { id: '' } ],
        id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
        issuer: '',
        type: 'VerifiableCredential'
      }
   result: [ { value: 19, path: [ '$', 'details', 'information', 0, 'age' ] } ]
   */
  public static extractInputField(obj: InputFieldType, paths: string[]): any[] {
    let result: any[] = [];
    if (paths) {
      for (const path of paths) {
        result = jp.nodes(obj, path);
        if (result.length) {
          break;
        }
      }
    }
    return result;
  }
}
