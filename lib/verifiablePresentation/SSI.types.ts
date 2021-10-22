import { PresentationSubmission } from '@sphereon/pe-models';
import { PathComponent } from 'jsonpath';

export interface CredentialSubject {
  id?: string;
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
  type: string[] | string;
  credentialSubject: CredentialSubject;
  issuer: unknown;
  issuanceDate?: string;
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
  type: string[] | string;
  verifiableCredential: VerifiableCredential[];
  holder: string;
  proof?: Proof;
}

export interface VerifiablePresentation extends Presentation {
  presentation_submission: PresentationSubmission;
}

export type CredentialSubjectJsonpathNode = { path: PathComponent[]; value: CredentialSubject };
