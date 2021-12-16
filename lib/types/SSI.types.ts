import {
  Format,
  InputDescriptorV1,
  InputDescriptorV2,
  PresentationDefinitionV1 as PdV1,
  PresentationDefinitionV2 as PdV2,
  PresentationSubmission,
  SubmissionRequirement,
} from '@sphereon/pe-models';

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
  getType(): string;

  getBaseCredential(): CredentialBase;

  getContext(): string[] | string;

  [x: string]: unknown;
}

export class CredentialBase {
  '@context': string[] | string;
  credentialStatus?: CredentialStatus;
  credentialSubject: CredentialSubject;
  description?: string;
  expirationDate?: string;
  id: string;
  issuanceDate: string;
  issuer: unknown;
  name?: string;
  type: string[];

  [x: string]: unknown;
}

export class CredentialJWT implements Credential {
  iss: string;
  exp?: string;
  nbf?: string; // (not before) claim identifies the time before which the JWT MUST NOT be accepted for processing
  vc: CredentialBase;

  [x: string]: unknown;

  getBaseCredential(): CredentialBase {
    return this.vc;
  }

  getContext(): string[] | string {
    return this.vc['@context'];
  }

  getType(): string {
    return 'jwt';
  }
}

export class CredentialJsonLD extends CredentialBase implements Credential {
  getBaseCredential(): CredentialBase {
    return this;
  }

  getContext(): string[] | string {
    return this['@context'];
  }

  getType(): string {
    return 'json-ld';
  }
}

export class VerifiableCredentialJsonLD extends CredentialJsonLD {
  proof: Proof | Proof[];

  constructor() {
    super();
  }
}

export class VerifiableCredentialJwt extends CredentialJWT {
  proof: Proof | Proof[];

  constructor() {
    super();
  }
}

export type VerifiableCredential = VerifiableCredentialJsonLD | VerifiableCredentialJwt;

export interface PresentationDefinition {
  format?: Format;
  id: string;
  name?: string;
  purpose?: string;
  submission_requirements?: Array<SubmissionRequirement>;

  getVersion(): PEVersion;
}

export class PresentationDefinitionV1 implements PdV1, PresentationDefinition {
  input_descriptors: Array<InputDescriptorV1>;

  constructor(
    id: string,
    input_descriptors: Array<InputDescriptorV1>,
    format?: Format,
    name?: string,
    purpose?: string,
    submission_requirements?: Array<SubmissionRequirement>
  ) {
    this.id = id;
    this.input_descriptors = input_descriptors;
    this.format = format;
    this.name = name;
    this.purpose = purpose;
    this.submission_requirements = submission_requirements;
  }

  format?: Format | undefined;
  id: string;
  name?: string | undefined;
  purpose?: string | undefined;
  submission_requirements?: SubmissionRequirement[] | undefined;

  getVersion(): PEVersion {
    return PEVersion.v1;
  }
}

export class PresentationDefinitionV2 implements PdV2, PresentationDefinition {
  format?: Format;
  frame?: any;
  id: string;
  input_descriptors: Array<InputDescriptorV2>;
  name?: string;
  purpose?: string;
  submission_requirements?: Array<SubmissionRequirement>;

  constructor(
    id: string,
    input_descriptors: Array<InputDescriptorV2>,
    format?: Format,
    frame?: any,
    name?: string,
    purpose?: string,
    submission_requirements?: Array<SubmissionRequirement>
  ) {
    this.format = format;
    this.frame = frame;
    this.id = id;
    this.input_descriptors = input_descriptors;
    this.name = name;
    this.purpose = purpose;
    this.submission_requirements = submission_requirements;
  }

  getVersion(): PEVersion {
    return PEVersion.v2;
  }
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

export enum PEVersion {
  v1 = 'v1',
  v2 = 'v2',
}
