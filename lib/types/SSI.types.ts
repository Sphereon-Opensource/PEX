import { PresentationDefinitionV1, PresentationDefinitionV2 } from '@sphereon/pex-models';
import { IVerifiableCredential, IVerifiablePresentation } from '@sphereon/ssi-types';

import { IInternalPresentationDefinition } from './Internal.types';

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
