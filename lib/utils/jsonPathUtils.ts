/* eslint-disable @typescript-eslint/no-explicit-any */
import jp from 'jsonpath';

import { IInternalPresentationDefinition } from '../types/Internal.types';
import { InputFieldType } from '../types/SSI.types';

export class JsonPathUtils {
  /**
   * @param verifiableCredential: a vc object can be found in verifiablePresentation.verifiableCredential[i]
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

  public static changePropertyNameRecursively(
    obj: IInternalPresentationDefinition,
    currentPropertyName: string,
    newPropertyName: string
  ): any {
    console.log(newPropertyName);
    const existingPaths: { value: unknown; path: (string | number)[] }[] = JsonPathUtils.extractInputField(obj, [
      '$..' + currentPropertyName,
    ]);
    const newPd = { ...obj };
    for (const existingPath of existingPaths) {
      this.copyResultPathToDestinationDefinition(existingPath.path, newPd, newPd, newPropertyName);
    }

    return newPd;
  }

  private static copyResultPathToDestinationDefinition(
    pathDetails: (string | number)[],
    pd: IInternalPresentationDefinition,
    pdToSend: IInternalPresentationDefinition,
    newPropertyName: string
  ) {
    let objectCursor: any = pd;
    let currentCursorInToSendObj: any = { ...pdToSend };
    for (let i = 1; i < pathDetails.length; i++) {
      objectCursor = objectCursor[pathDetails[i]];
      if (pathDetails.length == i + 1) {
        currentCursorInToSendObj[pathDetails[i]] = objectCursor;
        delete currentCursorInToSendObj[pathDetails[i]];
        currentCursorInToSendObj[newPropertyName] = objectCursor;
      } else if (typeof pathDetails[i] === 'string' && typeof pathDetails[i + 1] === 'string') {
        //currentCursorInToSendObj[pathDetails[i]] = {};
        currentCursorInToSendObj = currentCursorInToSendObj[pathDetails[i]];
      } else if (typeof pathDetails[i] === 'string' && typeof pathDetails[i + 1] !== 'string') {
        //currentCursorInToSendObj[pathDetails[i]] = [{}];
        currentCursorInToSendObj = currentCursorInToSendObj[pathDetails[i]];
      } else {
        //currentCursorInToSendObj[pathDetails[i]] = {};
        currentCursorInToSendObj = currentCursorInToSendObj[pathDetails[i]];
      }
    }
  }
}
