import { PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential } from './SSI.types';

/**
 * This is the object that will be sent as data in the presentation request.
 */
export interface VerifiablePresentation {
  getRoot(): unknown;

  getPresentationSubmission(): PresentationSubmission;

  getVerifiableCredentials(): Array<VerifiableCredential>;

  getHolder(): string;
}
