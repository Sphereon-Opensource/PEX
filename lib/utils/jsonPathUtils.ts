import { JSONPath as jp } from '@astronautlabs/jsonpath';
import { PresentationDefinitionV1, PresentationDefinitionV2 } from '@sphereon/pex-models';

import { InputFieldType, IPresentationDefinition, PathComponent } from '../types';

export class JsonPathUtils {
  static matchAll = require('string.prototype.matchall');
  static REGEX_PATH = /@\w+/g;
  /**
   * @param obj: any object can be found in verifiablePresentation.verifiableCredential[i]
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
  public static extractInputField(obj: InputFieldType, paths: string[]): { value: unknown; path: PathComponent[] }[] {
    let result: { value: unknown; path: PathComponent[] }[] = [];
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
    newPropertyName: string,
  ) {
    const existingPaths: { value: unknown; path: (string | number)[] }[] = JsonPathUtils.extractInputField(pd, ['$..' + currentPropertyName]);
    for (const existingPath of existingPaths) {
      this.copyResultPathToDestinationDefinition(existingPath.path, pd, newPropertyName);
    }
  }

  private static copyResultPathToDestinationDefinition(pathDetails: (string | number)[], pd: IPresentationDefinition, newPropertyName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const matches = this.matchAll(path, this.REGEX_PATH);
    path = this.modifyPathRecursive(matches, path);
    return path;
  }

  private static modifyPathRecursive(matches: IterableIterator<RegExpMatchArray>, path: string) {
    let next = matches.next();
    let indexChanged = false;
    while (next && !next.done && !indexChanged) {
      const atIdx: number | undefined = next.value.index;
      if (atIdx && atIdx == 1) {
        path = path.charAt(0) + "['" + next.value[0] + "']" + path.substring(atIdx + next.value[0].length);
        indexChanged = true;
        this.modifyPathRecursive(matches, path);
      } else if (atIdx && atIdx > 1 && path.substring(atIdx - 2, atIdx) !== "['" && path.substring(atIdx - 2, atIdx) !== '["') {
        if (path.substring(atIdx - 2, atIdx) === '..') {
          path = path.substring(0, atIdx - 2) + "..['" + next.value[0] + "']" + path.substring(atIdx + next.value[0].length);
          indexChanged = true;
          const matches = this.matchAll(path, this.REGEX_PATH);
          this.modifyPathRecursive(matches, path);
        } else if (path.charAt(atIdx - 1) === '.') {
          path = path.substring(0, atIdx - 1) + "['" + next.value[0] + "']" + path.substring(atIdx + next.value[0].length);
          indexChanged = true;
          this.modifyPathRecursive(matches, path);
        }
      }
      next = matches.next();
    }
    return path;
  }
}
