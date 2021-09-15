export class JwtAlgos {
  //TODO: pass it with a config file
  public static getJwtAlgos(): string[] {
    return [
      'HS256',
      'HS384',
      'HS512',
      'RS256',
      'RS384',
      'RS512',
      'ES256',
      'ES384',
      'ES512',
      'PS256',
      'PS384',
      'PS512',
      'none',
      'RSA1_5',
      'RSA-OAEP',
      'RSA-OAEP-256',
      'A128KW',
      'A192KW',
      'A256KW',
      'dir',
      'ECDH-ES',
      'ECDH-ES+A128KW',
      'ECDH-ES+A192KW',
      'ECDH-ES+A256KW',
      'A128GCMKW',
      'A192GCMKW',
      'A256GCMKW',
      'PBES2-HS256+A128KW',
      'PBES2-HS384+A192KW',
      'PBES2-HS512+A256KW',
    ];
  }
}
