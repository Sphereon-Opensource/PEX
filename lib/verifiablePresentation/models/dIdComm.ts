import { PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential } from '../verifiableCredential';

/***
 * Decentralized Identifiers Verifiable Presentation
 */
export class DIdComm {
  type: string;
  id: string;
  comment: string;
  formats: [];
  presentationsAttach: {
    id: string;
    mimeType: string;
    data: {
      json: {
        presentation_submission: PresentationSubmission;
      };
    };
  };
  verifiable_credentials: Array<VerifiableCredential>;
  holder: string;
}
