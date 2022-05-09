import { PresentationDefinitionV1, PresentationDefinitionV2, PresentationSubmission } from '@sphereon/pex-models';

import { IInternalPresentationDefinition, InternalCredential } from './Internal.types';

export interface ICredentialSubject {
  id?: string;

  [x: string]: unknown;
}

export type ICredentialContextType = ICredentialContext | string;

export interface ICredentialContext {
  name?: string;
  did?: string;
  [x: string]: unknown;
}

export type ICredentialSchemaType = ICredentialSchema | string;

export interface ICredentialSchema {
  id: string;
  type?: string;
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

export interface IProof {
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

export interface ICredentialStatus {
  id: string;
  type: string;
}

export interface IIssuer {
  id: string;

  [x: string]: unknown;
}

export interface IHasProof {
  proof: IProof | IProof[];
}

export type IPresentationDefinition = PresentationDefinitionV1 | PresentationDefinitionV2;

export type IVerifiableCredential = InternalCredential | IHasProof;

export interface IPresentation {
  '@context': ICredentialContextType | ICredentialContextType[];
  type: string[];
  verifiableCredential: IVerifiableCredential[];
  presentation_submission?: PresentationSubmission;
  holder?: string;
}

export type IVerifiablePresentation = IPresentation & IHasProof;

export type InputFieldType =
  | IVerifiablePresentation
  | IVerifiableCredential
  | IVerifiableCredential[]
  | IInternalPresentationDefinition
  | PresentationDefinitionV1
  | PresentationDefinitionV2
  | unknown;

export enum PEVersion {
  v1 = 'v1',
  v2 = 'v2',
}
