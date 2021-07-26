export class JsonUtils {
  static jsonHasKey(jsonObject: any, key: string): boolean {
    const keyHierarchy: string[] = key.split('.');
    let jsonObj = jsonObject;
    for (let i = 0; i < keyHierarchy.length; i++) {
      if (jsonObject[keyHierarchy[i]]) {
        jsonObj = jsonObj[keyHierarchy[i]];
      } else {
        return false;
      }
    }
    return true;
  }
}
