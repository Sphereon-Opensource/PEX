export class FunctionUtils {
  public static getPromiseIfAsync<T>(fn: any, ...params: any[]): Promise<T> | boolean {
    const isFunction = fn && typeof fn === 'function';
    if (isFunction) {
      const value = fn(...params) || false;
      if (value && value.constructor.name === 'Promise') {
        return value as Promise<T>;
      }
    }
    return false;
  }
}
