export class ObjectValidationUtils {
  public static optionalNonEmptyString(value: string | undefined): boolean {
    return value == null || value.length > 0;
  }

  public static nonEmptyString(value: string): boolean {
    return value != null && value.length > 0;
  }

  public static isValidDIDURI(uri: string): boolean {
    const pchar = "[a-zA-Z-\\._~]|%[0-9a-fA-F]{2}|[!$&'()*+,;=:@]";
    const format =
      '^' +
      'did:' +
      '([a-z0-9]+)' + // method_name
      '(:' + // method-specific-id
      '([a-zA-Z0-9\\.\\-_]|%[0-9a-fA-F]{2})+' +
      ')+' +
      '(/(' +
      pchar +
      ')*)?'; // + // path-abempty
    '(\\?(' +
      pchar +
      '|/|\\?)+)?' + // [ "?" query ]
      '(#(' +
      pchar +
      '|/|\\?)+)?'; // [ "#" fragment ]
    ('$');
    return new RegExp(format).test(uri);
  }
}
