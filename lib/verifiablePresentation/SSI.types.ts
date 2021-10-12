import { PresentationSubmission } from '@sphereon/pe-models';

export interface CredentialSubject {
  [x: string]: unknown;
}

export interface Proof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  jws: string;
  [x: string]: string;
}

export interface CredentialStatus {
  id: string;
  type: string;
}

export interface Credential {
  '@context': string[];
  id: string;
  type: string[];
  credentialSubject: CredentialSubject;
  issuer: string;
  issuanceDate?: string;
  expirationDate?: string;
  credentialStatus?: CredentialStatus;
  [x: string]: unknown;
}

export interface VerifiableCredential extends Credential {
  issuer: string;
  issuanceDate: string;
  proof: Proof;
}

export interface Presentation {
  '@context': string[];
  type: string;
  verifiableCredential: VerifiableCredential[];
  holder: string;
}

export interface VerifiablePresentation extends Presentation {
  presentationSubmission: PresentationSubmission;
  proof: Proof;
}

export interface OidcClaimJson {
  essential?: boolean;
  value?: string;
  values?: string[];
}

export interface OidcClaimRequest {
  [x: string]: null | OidcClaimJson;
}

export interface OidcClaim {
  vc?: OidcClaimRequest;
  [x: string]: unknown;
}

export interface LinkedDataProof {
  type: string;
  created: string;
  creator: string;
  nonce: string;
  signatureValue: string;
}
