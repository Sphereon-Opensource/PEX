import { SigningCallBackParams, VerifiablePresentation } from '../../lib';

export class SigningUtilMock {
  public getSinged(_opts: SigningCallBackParams): VerifiablePresentation {
    return {
      ..._opts.presentation,
      proof: {
        type: _opts.signingOptions.type,
        proofPurpose: _opts.signingOptions.proofPurpose,
        verificationMethod: _opts.signingOptions.verificationMethodOpts.id,
        proofValue: 'fake',
        created: new Date(Date.UTC(2021, 11, 1, 20, 10, 45)).toISOString(),
      },
    };
  }

  public getErrorThrown(): VerifiablePresentation {
    throw new Error('Could not sign because of missing fields');
  }
}
