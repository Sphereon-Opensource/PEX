import { IProof, IProofPurpose, IProofType, W3CVerifiablePresentation } from '@sphereon/ssi-types';

import { KeyEncoding, PresentationSignCallBackParams, ProofOptions, SignatureOptions } from '../../lib';

export function mockCallback(opts: PresentationSignCallBackParams): W3CVerifiablePresentation {
  return {
    ...opts.presentation,
    proof: {
      ...opts.proof,
      proofValue: 'fake',
      created: new Date(Date.UTC(2021, 11, 1, 20, 10, 45)).toISOString(),
    } as IProof,
  };
}

export function assertedMockCallback(callBackParams: PresentationSignCallBackParams): W3CVerifiablePresentation {
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

  if (typeof vp !== 'string') {
    const { proof } = vp;
    expect(proof).toBeDefined();
    if (Array.isArray(proof)) {
      throw Error('Multiple proofs not mocked/supported');
    }

    expect(proof.proofValue).toEqual('fake');
    expect(proof.created).toEqual('2021-12-01T20:10:45.000Z');
  }
  return vp;
}

export function assertedMockCallbackWithoutProofType(callBackParams: PresentationSignCallBackParams): W3CVerifiablePresentation {
  const vp = mockCallback(callBackParams);
  return vp;
}
export async function getErrorThrown(): Promise<W3CVerifiablePresentation> {
  throw Error('Could not sign because of missing fields');
}

export async function getAsyncErrorThrown(): Promise<W3CVerifiablePresentation> {
  throw Error('Could not sign because of missing fields');
}

export async function getAsyncCallbackWithoutProofType(callbackParams: PresentationSignCallBackParams): Promise<W3CVerifiablePresentation> {
  return mockCallback(callbackParams);
}

export function getProofOptionsMock(): ProofOptions {
  return {
    type: IProofType.EcdsaSecp256k1Signature2019,
    proofPurpose: IProofPurpose.authentication,
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
