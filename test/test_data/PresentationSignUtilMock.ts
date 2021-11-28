import {
  KeyEncoding,
  PresentationSignCallBackParams,
  Proof,
  ProofOptions,
  SignatureOptions,
  VerifiablePresentation,
} from '../../lib';
import { ProofPurpose, ProofType } from '../../lib/types/SSI.types';

export function mockCallback(opts: PresentationSignCallBackParams): VerifiablePresentation {
  return {
    ...opts.presentation,
    proof: {
      ...opts.proof,
      proofValue: 'fake',
      created: new Date(Date.UTC(2021, 11, 1, 20, 10, 45)).toISOString(),
    } as Proof,
  };
}

export function assertedMockCallback(callBackParams: PresentationSignCallBackParams): VerifiablePresentation {
  expect(callBackParams.proof).toBeDefined();
  expect(callBackParams.proof.proofValue).toBeUndefined();
  expect(callBackParams.proof.created).toBeDefined();
  expect(callBackParams.proof.verificationMethod).toBeDefined();
  expect(callBackParams.proof.type).toBeDefined();
  expect(callBackParams.presentation).toBeDefined();
  expect(callBackParams.options).toBeDefined();
  expect(callBackParams.options.proofOptions?.created).toBeUndefined();

  const vp = mockCallback(callBackParams);
  expect(vp).toBeDefined();

  const { proof } = vp;
  expect(proof).toBeDefined();
  if (Array.isArray(proof)) {
    throw Error('Multiple proofs not mocked/supported');
  }

  expect(proof.proofValue).toEqual('fake');
  expect(proof.created).toEqual('2021-12-01T20:10:45.000Z');
  return vp;
}

export function getErrorThrown(): VerifiablePresentation {
  throw new Error('Could not sign because of missing fields');
}

export function getProofOptionsMock(): ProofOptions {
  return {
    type: ProofType.EcdsaSecp256k1Signature2019,
    proofPurpose: ProofPurpose.authentication,
  };
}

export function getSingatureOptionsMock(): SignatureOptions {
  return {
    verificationMethod: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489#key',
    privateKey: '8n9X3umWgqMFe29mwdpnCuc13CzLJv9e4nt6wcuEDmWQ',
    keyEncoding: KeyEncoding.Base58,
  };
}

//publicKey: '258wwuTF2ubgve63SHy95kiPFBo3ZrBxH9H3YerwTCouhdypo3YHZuJyfYPTUiJEod9oFV7AwG7h7RKo9wUM1bXvyJqctq5dxhLWPcNZXoJoNrnN7qbFDwwJ9jdD2nqY2ewa',
//controller: 'did:ethr:0x8D0E24509b79AfaB3A74Be1700ebF9769796B489',
