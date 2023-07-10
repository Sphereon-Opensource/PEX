import {
  Format,
  InputDescriptorV1,
  InputDescriptorV2,
  PresentationDefinitionV1,
  PresentationDefinitionV2,
  SubmissionRequirement,
} from '@sphereon/pex-models';
import { IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types';

export type PathComponent = string | number;
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
    submission_requirements?: Array<SubmissionRequirement>,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frame?: any,
    name?: string,
    purpose?: string,
    submission_requirements?: Array<SubmissionRequirement>,
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

export interface DiscoveredVersion {
  version?: PEVersion;
  error?: string;
}

export type IPresentationDefinition = PresentationDefinitionV1 | PresentationDefinitionV2;

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
