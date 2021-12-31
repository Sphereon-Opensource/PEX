import {
  Format,
  InputDescriptorV1,
  InputDescriptorV2,
  PresentationDefinitionV1,
  PresentationDefinitionV2,
  PresentationSubmission,
  SubmissionRequirement,
} from '@sphereon/pex-models';

export interface CredentialSubject {
  id?: string;

  [x: string]: unknown;
}

export interface CredentialSchema {
  id: string;
  type: string;
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

export interface InternalCredential {
  getAudience(): string | undefined;

  getBaseCredential(): InternalCredentialBase;

  getContext(): string[] | string;

  getCredentialSchema(): CredentialSchema | CredentialSchema[];

  getExpirationDate(): string | undefined;

  getId(): string | undefined;

  getIssuer(): unknown;

  getIssuanceDate(): string | undefined;

  getJti(): string | undefined;

  getType(): string;

  [x: string]: unknown;
}

export class InternalCredentialBase {
  '@context': string[] | string;
  credentialStatus?: CredentialStatus;
  credentialSubject: CredentialSubject;
  credentialSchema?: undefined | CredentialSchema | CredentialSchema[];
  description?: string;
  expirationDate?: string;
  id: string;
  issuanceDate: string;
  issuer: unknown;
  name?: string;
  type: string[];

  [x: string]: unknown;
}

export class InternalCredentialJWT implements InternalCredential {
  /**
   * aud MUST represent (i.e., identify) the intended audience of the verifiable presentation
   * (i.e., the verifier intended by the presenting holder to receive and verify the verifiable presentation).
   */
  aud?: string;

  /**
   * MUST represent the expirationDate property, encoded as a UNIX timestamp (NumericDate).
   */
  exp?: string;

  /**
   * MUST represent the issuer property of a verifiable credential or the holder property of a verifiable presentation.
   */
  iss: string;

  /**
   * MUST represent the id property of the verifiable credential or verifiable presentation.
   */
  jti?: string;

  /**
   * MUST represent issuanceDate, encoded as a UNIX timestamp (NumericDate).
   */
  nbf?: string;

  /**
   * MUST represent the id property contained in the verifiable credential subject.
   */
  sub?: string;

  vc: InternalCredentialBase;

  [x: string]: unknown;

  getBaseCredential(): InternalCredentialBase {
    return this.vc;
  }

  getContext(): string[] | string {
    return this.vc['@context'];
  }

  getCredentialSchema(): CredentialSchema | CredentialSchema[] {
    if (this.vc.credentialSchema) {
      return this.vc.credentialSchema;
    }
    return [];
  }

  getType(): string {
    return 'jwt';
  }

  getAudience(): string | undefined {
    return this.aud;
  }

  getExpirationDate(): string | undefined {
    return this.exp;
  }

  getId(): string | undefined {
    return this.sub;
  }

  getIssuer(): unknown {
    return this.iss;
  }

  getIssuanceDate(): string | undefined {
    return this.nbf;
  }

  getJti(): string | undefined {
    return this.jti;
  }
}

export class InternalCredentialJsonLD extends InternalCredentialBase implements InternalCredential {
  getBaseCredential(): InternalCredentialBase {
    return this;
  }

  getContext(): string[] | string {
    return this['@context'];
  }

  getCredentialSchema(): CredentialSchema[] | CredentialSchema {
    if (this.credentialSchema) {
      return this.credentialSchema;
    }
    return [];
  }

  getType(): string {
    return 'json-ld';
  }

  // TODO: see if there's any equivalent for jwt's aud in JSON-LD standard, I couldn't find anything
  getAudience(): string | undefined {
    return undefined;
  }

  getExpirationDate(): string | undefined {
    return this.expirationDate;
  }

  getId(): string {
    return this.id;
  }

  getIssuanceDate(): string | undefined {
    return this.issuanceDate;
  }

  getIssuer(): unknown {
    return this.issuer;
  }

  getJti(): string | undefined {
    return undefined;
  }
}

export class InternalVerifiableCredentialJsonLD extends InternalCredentialJsonLD {
  proof: Proof | Proof[];

  constructor() {
    super();
  }
}

export class InternalVerifiableCredentialJwt extends InternalCredentialJWT {
  proof: Proof | Proof[];

  constructor() {
    super();
  }
}

export type InternalVerifiableCredential = InternalVerifiableCredentialJsonLD | InternalVerifiableCredentialJwt;

export interface JwtCredential {
  aud?: string;
  exp?: string;
  iss: string;
  jti?: string;
  nbf?: string;
  sub?: string;
  vc: InternalCredentialBase;
  [x: string]: unknown;
}

export interface JsonLdCredential {
  '@context': string[] | string;
  credentialStatus?: CredentialStatus;
  credentialSubject: CredentialSubject;
  credentialSchema?: CredentialSchema | CredentialSchema[];
  description?: string;
  expirationDate?: string;
  id: string;
  issuanceDate: string;
  issuer: unknown;
  name?: string;
  type: string[];
  [x: string]: unknown;
}

export type Credential = JwtCredential | JsonLdCredential;

export interface JwtVerifiableCredential extends JwtCredential {
  proof: Proof | Proof[];
}

export interface JsonLdVerifiableCredential extends JsonLdCredential {
  proof: Proof | Proof[];
}

export type VerifiableCredential = JwtVerifiableCredential | JsonLdVerifiableCredential;

export interface InternalPresentationDefinition {
  format?: Format;
  id: string;
  name?: string;
  purpose?: string;
  submission_requirements?: Array<SubmissionRequirement>;

  getVersion(): PEVersion;
}

export class InternalPresentationDefinitionV1 implements PresentationDefinitionV1, InternalPresentationDefinition {
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

export class InternalPresentationDefinitionV2 implements PresentationDefinitionV2, InternalPresentationDefinition {
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
  | InternalVerifiableCredential
  | InternalVerifiableCredential[]
  | InternalPresentationDefinition;

export enum PEVersion {
  v1 = 'v1',
  v2 = 'v2',
}
