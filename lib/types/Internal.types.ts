import {
  Format,
  InputDescriptorV1,
  InputDescriptorV2,
  PresentationDefinitionV1,
  PresentationDefinitionV2,
  SubmissionRequirement,
} from '@sphereon/pex-models';

import {
  ICredentialSchema,
  ICredentialStatus,
  ICredentialSubject,
  IIssuer,
  PEVersion,
} from './SSI.types';

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

export interface WrappedVerifiableCredential {
  /**
   * Original VC that we've received
   */
  original: unknown;
  /**
   * In case of JWT credential it will be the decoded version. In other cases it will be the same as original one
   */
  decoded: unknown;
  /**
   * Type of this credential. Supported types are json-ld and jwt
   */
  type: VerifiableDataExchangeType;
  /**
   * created based on https://www.w3.org/TR/vc-data-model/#jwt-decoding
   */
  internalCredential: InternalCredential;
}

export interface WrappedVerifiablePresentation {
  original: unknown;
  decoded: unknown;
  type: VerifiableDataExchangeType;
  vcs: WrappedVerifiableCredential[];
}

export enum VerifiableDataExchangeType {
  JSONLD, JWT_ENCODED, JWT_DECODED
}

export interface InternalCredential {
  // If exp is present, the UNIX timestamp MUST be converted to an [XMLSCHEMA11-2] date-time, and MUST be used to set the value of the expirationDate property of credentialSubject of the new JSON object.
  expirationDate?: string;
  // If iss is present, the value MUST be used to set the issuer property of the new credential JSON object or the holder property of the new presentation JSON object.
  issuer: string | IIssuer;
  // If nbf is present, the UNIX timestamp MUST be converted to an [XMLSCHEMA11-2] date-time, and MUST be used to set the value of the issuanceDate property of the new JSON object.
  issuanceDate: string;
  // If sub is present, the value MUST be used to set the value of the id property of credentialSubject of the new credential JSON object.
  credentialSubject: ICredentialSubject;
  // If jti is present, the value MUST be used to set the value of the id property of the new JSON object.
  id: string;
  '@context': string[] | string;
  credentialStatus?: ICredentialStatus;
  credentialSchema?: undefined | ICredentialSchema | ICredentialSchema[];
  description?: string;
  name?: string;
  type: string[];

  [x: string]: unknown;
}