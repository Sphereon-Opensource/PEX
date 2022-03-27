import {
  Format,
  InputDescriptorV1,
  InputDescriptorV2,
  PresentationDefinitionV1,
  PresentationDefinitionV2,
  PresentationSubmission,
  SubmissionRequirement,
} from '@sphereon/pex-models';

import {
  ICredentialSchema,
  ICredentialStatus,
  ICredentialSubject,
  IIssuer,
  IJsonLdCredential,
  IJsonLDPresentation,
  IProof,
  IVerifiableCredential,
  PEVersion,
} from './SSI.types';

export abstract class BasePresentation implements IJsonLDPresentation {
  '@context': string[];
  holder: string;
  presentation_submission?: PresentationSubmission;
  type: string[];
  verifiableCredential: IVerifiableCredential[];
  [x: string]: unknown;
}

export interface InternalPresentation {
  getAudience(): string | undefined;

  getBasePresentation(): BasePresentation;

  getContext(): string[] | string;

  getExpirationDate(): string | undefined;

  getIat(): string | undefined;

  getIssuer(): unknown;

  getIssuanceDate(): string | undefined; // not sure if we need this, what do you think @nlklomp

  getJti(): string | undefined;

  getNonce(): string | undefined;

  getType(): string;

  [x: string]: unknown;
}

export class InternalPresentationJWT implements InternalPresentation {
  /**
   * aud MUST represent (i.e., identify) the intended audience of the verifiable presentation
   * (i.e., the verifier intended by the presenting holder to receive and verify the verifiable presentation).
   */
  aud?: string;

  /**
   * MUST represent the expirationDate property, encoded as a UNIX timestamp (NumericDate).
   */
  exp?: string | number;

  /**
   *
   */
  iat: string | undefined;

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
  nbf?: string | number;

  nonce?: string;

  vp: BasePresentation;

  [x: string]: unknown;

  getAudience(): string | undefined {
    return this.aud;
  }

  getBasePresentation(): BasePresentation {
    return this.vp;
  }

  getContext(): string[] | string {
    return this.vp['@context'];
  }

  getExpirationDate(): string | undefined {
    return this.exp?.toString();
  }

  getIat(): string | undefined {
    return this.iat;
  }

  getIssuanceDate(): string | undefined {
    return this.nbf?.toString();
  }

  getIssuer(): unknown {
    return this.iss;
  }

  getJti(): string | undefined {
    return this.jti;
  }

  getNonce(): string | undefined {
    return this.nonce;
  }

  getType(): string {
    return 'jwt';
  }
}

export class InternalPresentationJsonLD extends BasePresentation implements InternalPresentation {
  // TODO: see if there's any equivalent for jwt's aud in JSON-LD standard, I couldn't find anything
  getAudience(): string | undefined {
    return undefined;
  }

  getBasePresentation(): BasePresentation {
    return this;
  }

  getContext(): string[] | string {
    return this['@context'];
  }

  // TODO: see if there's any equivalent for jwt's exp in JSON-LD standard, I couldn't find anything
  getExpirationDate(): string | undefined {
    return undefined;
  }

  getIat(): string | undefined {
    return undefined;
  }

  getIssuanceDate(): string | undefined {
    return undefined;
  }

  // TODO: see if there's any equivalent for jwt's iss in JSON-LD standard, I couldn't find anything
  getIssuer(): unknown {
    return undefined;
  }

  getJti(): string | undefined {
    return undefined;
  }

  getNonce(): string | undefined {
    return undefined;
  }

  getType(): string {
    return 'json-ld';
  }
}

export interface IInternalCredential {
  getAudience(): string | undefined;

  getBaseCredential(): BaseCredential;

  getContext(): string[] | string;

  getCredentialSchema(): ICredentialSchema | ICredentialSchema[];

  getExpirationDate(): string | undefined;

  getId(): string | undefined;

  getIssuer(): unknown;

  getIssuanceDate(): string | undefined;

  getJti(): string | undefined;

  getType(): string;

  [x: string]: unknown;
}

export class InternalCredentialJWT implements IInternalCredential {
  /**
   * aud MUST represent (i.e., identify) the intended audience of the verifiable presentation
   * (i.e., the verifier intended by the presenting holder to receive and verify the verifiable presentation).
   */
  aud?: string;

  /**
   * MUST represent the expirationDate property, encoded as a UNIX timestamp (NumericDate).
   */
  exp?: string | number;

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
  nbf?: string | number;

  /**
   * MUST represent the id property contained in the verifiable credential subject.
   */
  sub?: string;

  vc: BaseCredential;

  [x: string]: unknown;

  getBaseCredential(): BaseCredential {
    return this.vc;
  }

  getContext(): string[] | string {
    return this.vc['@context'];
  }

  getCredentialSchema(): ICredentialSchema | ICredentialSchema[] {
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
    return this.exp?.toString();
  }

  getId(): string | undefined {
    return this.sub;
  }

  getIssuer(): unknown {
    return this.iss;
  }

  getIssuanceDate(): string | undefined {
    return this.nbf?.toString();
  }

  getJti(): string | undefined {
    return this.jti;
  }
}

export abstract class BaseCredential implements IJsonLdCredential {
  '@context': string[] | string;
  credentialStatus?: ICredentialStatus;
  credentialSubject: ICredentialSubject;
  credentialSchema?: undefined | ICredentialSchema | ICredentialSchema[];
  description?: string;
  expirationDate?: string;
  id: string;
  issuanceDate: string;
  issuer: string | IIssuer;
  name?: string;
  type: string[];

  [x: string]: unknown;
}

export class InternalCredentialJsonLD extends BaseCredential implements IInternalCredential {
  getBaseCredential(): BaseCredential {
    return this;
  }

  getContext(): string[] | string {
    return this['@context'];
  }

  getCredentialSchema(): ICredentialSchema[] | ICredentialSchema {
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
  proof: IProof | IProof[];

  constructor() {
    super();
  }
}

export class InternalVerifiableCredentialJwt extends InternalCredentialJWT {
  proof: IProof | IProof[];

  constructor() {
    super();
  }
}

export type InternalVerifiableCredential = InternalVerifiableCredentialJsonLD | InternalVerifiableCredentialJwt;

export interface IInternalPresentationDefinition {
  format?: Format;
  id: string;
  name?: string;
  purpose?: string;
  submission_requirements?: Array<SubmissionRequirement>;

  getVersion(): PEVersion;
}

export class InternalPresentationDefinitionV1 implements PresentationDefinitionV1, IInternalPresentationDefinition {
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

export class InternalPresentationDefinitionV2 implements PresentationDefinitionV2, IInternalPresentationDefinition {
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
