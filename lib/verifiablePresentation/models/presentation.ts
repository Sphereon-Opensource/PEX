import { PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential } from '../verifiableCredential';

/***
 * Verifiable presentation - generic
 */
export class Presentation {
  context: Array<string>;
  presentation_submission: PresentationSubmission;
  type: Array<string>;
  verifiable_credential: Array<VerifiableCredential>;
  proof: any;
}
