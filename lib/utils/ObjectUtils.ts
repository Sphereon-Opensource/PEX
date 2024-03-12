export class ObjectUtils {
  public static asArray(value: unknown) {
    return Array.isArray(value) ? value : [value];
  }

  public static isObject(value: unknown) {
    return Object.prototype.toString.call(value) === '[object Object]';
  }

  public static isUrlAbsolute(url: string) {
    // regex to check for absolute IRI (starting scheme and ':') or blank node IRI
    const isAbsoluteRegex = /^([A-Za-z][A-Za-z0-9+-.]*|_):[^\s]*$/;
    ObjectUtils.isString(url) && isAbsoluteRegex.test(url);
  }

  public static isString(value: unknown): boolean {
    return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
  }

  /**
   * Receives an object array and for the field in question, returns the unique values
   */
  public static getDistinctFieldInObject(data: unknown[], fieldName: string): unknown[] {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const fieldValues = data.map((item) => item[fieldName]);
    return Array.from(new Set(fieldValues));
  }
  /**
   * Receives an object and clone deep, return the cloned object
   */
  public static cloneDeep<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      const arrCopy: Array<unknown> = [];
      obj.forEach((v, i) => (arrCopy[i] = ObjectUtils.cloneDeep<T>(v)));
      return arrCopy as T;
    }

    const copiedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      copiedObj[key] = ObjectUtils.cloneDeep<T>(value);
    }
    return copiedObj as T;
  }
}
