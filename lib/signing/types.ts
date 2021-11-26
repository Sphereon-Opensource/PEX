import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

import { EvaluationResults } from '../evaluation';
import { Presentation, VerifiableCredential } from '../verifiablePresentation';

export interface ProofOptions {
  /**
   * The verification method opts
   */
  verificationMethodOpts: VerificationMethodOpts;
  /**
   * The private key
   */
  readonly privateKey: string;

  type: string;

  challenge?: string;

  domain?: string;

  proofPurpose: string;
}

export interface VerificationMethodOpts {
  /**
   * The VM id
   */
  readonly id: string;
  /**
   * The VM controller
   */
  readonly controller: string;

  /**
   * The public key
   */
  readonly publicKey?: string;

  /**
   * Key encoding
   */
  readonly keyEncoding: KeyEncoding;
}

export enum KeyEncoding {
  Jwk = 'publicKeyJwk',
  Base58 = 'publicKeyBase58',
  Hex = 'publicKeyHex',
  Multibase = 'publicKeyMultibase',
}

export interface SigningParams {
  presentationDefinition: PresentationDefinition;
  selectedCredentials: VerifiableCredential[];
  signingOptions: ProofOptions;
}

export interface SigningCallBackParams extends SigningParams {
  presentation: Presentation;
  presentationSubmission: PresentationSubmission;
  evaluationResults: EvaluationResults;
}
