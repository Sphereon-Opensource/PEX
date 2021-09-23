export class LdpTypes {
  //TODO: pass it with a config file
  public static getLdpTypes(): string[] {
    return [
      'Ed25519VerificationKey2018',
      'Ed25519Signature2018',
      'RsaSignature2018',
      'EcdsaSecp256k1Signature2019',
      'EcdsaSecp256k1RecoverySignature2020',
      'JsonWebSignature2020',
      'GpgSignature2020',
      'JcsEd25519Signature2020',
      'BbsBlsSignature2020',
      'Bls12381G2Key2020',
    ];
  }
}
