import { KeyEncoding, ProofOptions } from '../../lib';

export class KeyPairOptionsData {
  public getKeyPairOptionsData(): ProofOptions {
    return {
      verificationMethodOpts: {
        id: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489#key',
        controller: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
        publicKey:
          '258wwuTF2ubgve63SHy95kiPFBo3ZrBxH9H3YerwTCouhdypo3YHZuJyfYPTUiJEod9oFV7AwG7h7RKo9wUM1bXvyJqctq5dxhLWPcNZXoJoNrnN7qbFDwwJ9jdD2nqY2ewa',
        keyEncoding: KeyEncoding.Base58,
      },
      privateKey: '8n9X3umWgqMFe29mwdpnCuc13CzLJv9e4nt6wcuEDmWQ',
      type: 'EcdsaSecp256k1Signature2019',
      proofPurpose: 'authentication',
    };
  }
}
