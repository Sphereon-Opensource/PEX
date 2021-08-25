import { PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential } from '../verifiableCredential';

/***
 * Credential Handler API Verifiable Presentation
 */
export class Chapi {
  type: string;
  dataType: string;
  data: {
    presentation_submission: PresentationSubmission;
  };
  verifiable_credential: Array<VerifiableCredential>;
  holder?: string;
  proof: unknown;
}
