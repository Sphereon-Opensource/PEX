import { PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential } from './verifiableCredential';
import { VerifiablePresentation } from './verifiablePresentation';

/***
 * Decentralized Identifiers Verifiable Presentation
 */
export class DIDCommsVP implements VerifiablePresentation {
  type: string;
  id: string;
  comment: string;
  formats: Array<any>;
  presentationsAttach: {
    id: string,
    mimeType: string,
    data: {
      json: {
        presentation_submission: PresentationSubmission
      }
    };
  };

  public getPresentationSubmission(): PresentationSubmission {
    return undefined;
  }

  public getVerifiableCredentials(): Array<VerifiableCredential> {
    return undefined;
  }
}
