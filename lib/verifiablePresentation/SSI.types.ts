import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

export interface CredentialSubject {
  id?: string;
  [x: string]: unknown;
}

export interface Proof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
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
  issuer: unknown;
  issuanceDate: string;
  expirationDate?: string;
  credentialStatus?: CredentialStatus;
  vc?: VerifiableCredential;
  [x: string]: unknown;
}

export interface VerifiableCredential extends Credential {
  proof: Proof;
}

export interface Presentation {
  '@context': string[];
  type: string[];
  verifiableCredential: VerifiableCredential[];
  presentation_submission?: PresentationSubmission;
  holder?: string;
}

export interface VerifiablePresentation extends Presentation {
  proof: Proof;
}

export type InputFieldType =
  | VerifiablePresentation
  | VerifiableCredential
  | VerifiableCredential[]
  | PresentationDefinition;
