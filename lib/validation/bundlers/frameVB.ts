import { ObjectUtils } from '../../utils';
import { Validation } from '../core';

import { ValidationBundler } from './validationBundler';

export class FrameVB extends ValidationBundler<unknown> {
  private readonly frameIsValidMsg = 'frame value is not valid';

  constructor(parentTag: string) {
    super(parentTag, 'frame');
  }

  public getValidations(frame: unknown): Validation<unknown>[] {
    let validations: Validation<unknown>[] = [];
    validations = [...validations, ...this.getMyValidations(frame)];

    return validations;
  }

  private getMyValidations(frame: unknown): Validation<unknown>[] {
    return [
      {
        tag: this.getMyTag(),
        target: frame,
        predicate: FrameVB.frameIsValid,
        message: this.frameIsValidMsg,
      },
    ];
  }

  protected getMyTag() {
    return this.parentTag + '.' + this.myTag;
  }

  /**
   * this is based on https://github.com/digitalbazaar/jsonld.js/blob/main/lib/frame.js
   * @param frame
   */
  private static frameIsValid(frame: unknown): boolean {
    if (!frame || Array.isArray(frame) || !(typeof frame === 'object')) {
      return false;
    }
    const fr = frame as Frame;
    if (fr && fr['@id' as keyof Frame]) {
      for (const id of ObjectUtils.asArray(frame['@id' as keyof Frame])) {
        // @id must be wildcard or an IRI
        if (!(ObjectUtils.isObject(id) || ObjectUtils.isUrlAbsolute(id)) || (ObjectUtils.isString(id) && id.indexOf('_:') === 0)) {
          return false;
        }
      }
    }
    //
    if (fr['@types' as keyof Frame]) {
      for (const type of ObjectUtils.asArray(frame['@types' as keyof Frame])) {
        // @id must be wildcard or an IRI
        if (!(ObjectUtils.isObject(type) || ObjectUtils.isUrlAbsolute(type)) || (ObjectUtils.isString(type) && type.indexOf('_:') === 0)) {
          return false;
        }
      }
    }
    return true;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Frame {}
