/* eslint-disable @typescript-eslint/no-explicit-any */
import { PresentationDefinitionV1, PresentationDefinitionV2 } from '@sphereon/pex-models';
import jp from 'jsonpath';

import { InputFieldType, IPresentationDefinition } from '../types';

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
    pd: PresentationDefinitionV1 | PresentationDefinitionV2,
    currentPropertyName: string,
    newPropertyName: string
  ) {
    const existingPaths: { value: unknown; path: (string | number)[] }[] = JsonPathUtils.extractInputField(pd, [
      '$..' + currentPropertyName,
    ]);
    for (const existingPath of existingPaths) {
      this.copyResultPathToDestinationDefinition(existingPath.path, pd, newPropertyName);
    }
  }

  private static copyResultPathToDestinationDefinition(
    pathDetails: (string | number)[],
    pd: IPresentationDefinition,
    newPropertyName: string
  ) {
    let objectCursor: any = pd;
    for (let i = 1; i < pathDetails.length; i++) {
      if (i + 1 < pathDetails.length) {
        objectCursor = objectCursor[pathDetails[i]];
      }
      if (pathDetails.length == i + 1) {
        objectCursor[newPropertyName] = objectCursor[pathDetails[i]];
        delete objectCursor[pathDetails[i]];
        break;
      }
    }
  }

  static changeSpecialPathsRecursively(pd: IPresentationDefinition) {
    const paths: { value: unknown; path: (string | number)[] }[] = JsonPathUtils.extractInputField(pd, ['$..path']);
    for (const path of paths) {
      this.modifyPathsWithSpecialCharacter(path.path, pd);
    }
  }

  private static modifyPathsWithSpecialCharacter(pathDetails: (string | number)[], pd: IPresentationDefinition) {
    let objectCursor: any = pd;
    for (let i = 1; i < pathDetails.length; i++) {
      if (i + 1 < pathDetails.length) {
        objectCursor = objectCursor[pathDetails[i]];
      }
      if (pathDetails.length == i + 1) {
        const paths: string[] = objectCursor[pathDetails[i]];
        const editedPaths: string[] = [];
        for (let j = 0; j < paths.length; j++) {
          editedPaths.push(this.modifyPathWithSpecialCharacter(paths[j]));
        }
        objectCursor[pathDetails[i]] = editedPaths;
        break;
      }
    }
  }

  private static modifyPathWithSpecialCharacter(path: string): string {
    const REGEX_PATH_ESCAPED = /\['@\w+']/g;
    const REGEX_PATH = /@\w+/g;
    const resultEscaped = path.matchAll(REGEX_PATH_ESCAPED);
    const resultNotEscaped = path.matchAll(REGEX_PATH);
    let nextExist = true;
    const escapedIndices = [];
    while (nextExist) {
      const next = resultEscaped.next();
      if (!next.done) {
        escapedIndices.push(next.value['index']);
        nextExist = true;
      } else {
        nextExist = false;
      }
    }
    nextExist = true;
    const indices: Map<number, string> = new Map<number, string>();
    while (nextExist) {
      const next = resultNotEscaped.next();
      if (!next.done) {
        indices.set(<number>next.value['index'], next.value[0]);
        nextExist = true;
      } else {
        nextExist = false;
      }
    }
    for (let i = 0; i < indices.size; i++) {
      const value = indices.entries().next();
      if (!escapedIndices.find((el) => el == value.value[0] - 2)) {
        path = path.replace(REGEX_PATH, ".['" + value.value[1] + "']");
      }
    }
    return path;
  }
}
