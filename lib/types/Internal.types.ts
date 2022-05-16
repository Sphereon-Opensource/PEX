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
  ICredential,
  ICredentialContextType,
  IVerifiableCredential,
  IVerifiablePresentation,
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
  original: string | JwtWrappedVerifiableCredential | IVerifiableCredential;
  /**
   * In case of JWT credential it will be the decoded version. In other cases it will be the same as original one
   */
  decoded: JwtWrappedVerifiableCredential | IVerifiableCredential;
  /**
   * Type of this credential. Supported types are json-ld and jwt
   */
  type: VerifiableDataExchangeType;
  /**
   * created based on https://www.w3.org/TR/vc-data-model/#jwt-decoding
   */
  internalCredential: ICredential;
}

export interface WrappedVerifiablePresentation {
  original: string | JwtWrappedVerifiablePresentation | IVerifiablePresentation;
  decoded: JwtWrappedVerifiablePresentation | IVerifiablePresentation;
  type: VerifiableDataExchangeType;
  internalPresentation: InternalPresentation;
  vcs: WrappedVerifiableCredential[];
}

export enum VerifiableDataExchangeType {
  JSONLD,
  JWT_ENCODED,
  JWT_DECODED,
}

export interface InternalPresentation {
  '@context': ICredentialContextType | ICredentialContextType[];
  type: string[];
  verifiableCredential: WrappedVerifiableCredential[];
  presentation_submission?: PresentationSubmission;
  holder?: string;
}

export interface JwtWrappedVerifiableCredential {
  vc: ICredential;
  exp: string;
  iss: string;
  nbf: string;
  sub: string;
  jti: string;
}

export interface JwtWrappedVerifiablePresentation {
  vp: IVerifiablePresentation;
  exp: string;
  iss: string;
  nbf: string;
  sub: string;
  jti: string;
}
