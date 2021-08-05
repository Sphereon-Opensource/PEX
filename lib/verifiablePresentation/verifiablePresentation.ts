import { PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential } from './verifiableCredential';

/**
 * This is the object that will be sent as data in the presentation request.
 */
export interface VerifiablePresentation {

  getPresentationSubmission(): PresentationSubmission;

  getVerifiableCredentials(): Array<VerifiableCredential>;

}
