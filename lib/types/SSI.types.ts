import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';

export interface CredentialSubject {
  id?: string;

  [x: string]: unknown;
}

export enum ProofType {
  Ed25519Signature2018 = 'Ed25519Signature2018',
  Ed25519Signature2020 = 'Ed25519Signature2020',
  EcdsaSecp256k1Signature2019 = 'EcdsaSecp256k1Signature2019',
  EcdsaSecp256k1RecoverySignature2020 = 'EcdsaSecp256k1RecoverySignature2020',
  JsonWebSignature2020 = 'JsonWebSignature2020',
  RsaSignature2018 = 'RsaSignature2018',
  GpgSignature2020 = 'GpgSignature2020',
  JcsEd25519Signature2020 = 'JcsEd25519Signature2020',
  BbsBlsSignatureProof2020 = 'BbsBlsSignatureProof2020',
  BbsBlsBoundSignatureProof2020 = 'BbsBlsBoundSignatureProof2020',
}

export enum ProofPurpose {
  assertionMethod = 'assertionMethod',
  authentication = 'authentication',
  keyAgreement = 'keyAgreement',
  contractAgreement = 'contactAgreement',
  capabilityInvocation = 'capabilityInvocation',
  capabilityDelegation = 'capabilityDelegation',
}

export interface Proof {
  type: ProofType | string; // The proof type
  created: string; // The ISO8601 date-time string for creation
  proofPurpose: ProofPurpose | string; // The specific intent for the proof
  verificationMethod: string; // A set of parameters required to independently verify the proof
  challenge?: string; // A challenge to protect against replay attacks
  domain?: string; // A string restricting the (usage of a) proof to the domain and protects against replay attacks
  proofValue?: string; // One of any number of valid representations of proof values
  jws?: string; // JWS based proof
  nonce?: string; // Similar to challenge. A nonce to protect against replay attacks, used in some ZKP proofs
  requiredRevealStatements?: string[]; // The parts of the proof that must be revealed in a derived proof

  [x: string]: string | string[] | undefined;
}

export interface CredentialStatus {
  id: string;
  type: string;
}

export interface Issuer {
  id: string;

  [x: string]: unknown;
}

export interface Credential {
  '@context': string[];
  id: string;
  type: string[];
  credentialSubject: CredentialSubject;
  issuer: string | Issuer;
  issuanceDate: string;
  expirationDate?: string;
  credentialStatus?: CredentialStatus;
  vc?: VerifiableCredential; // fixme: This probably doesn't make sense, at this is used in JWT based credentials, but these to do not have the outermost properties typically

  [x: string]: unknown;
}

export interface VerifiableCredential extends Credential {
  proof: Proof | Proof[];
}

export interface Presentation {
  '@context': string[];
  type: string[];
  verifiableCredential: VerifiableCredential[];
  presentation_submission?: PresentationSubmission;
  holder?: string;
}

export interface VerifiablePresentation extends Presentation {
  proof: Proof | Proof[];
}

export type InputFieldType =
  | VerifiablePresentation
  | VerifiableCredential
  | VerifiableCredential[]
  | PresentationDefinition;
