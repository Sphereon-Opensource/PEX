import { PresentationSubmission } from '@sphereon/pe-models';

import { DIdComm } from './models';
import { VerifiableCredential } from './verifiableCredential';
import { VerifiablePresentation } from './verifiablePresentation';

/***
 * Decentralized Identifiers Verifiable Presentation
 */
export class DIDCommVP implements VerifiablePresentation {
  private dIdCommsMessage: DIdComm;

  public getPresentationSubmission(): PresentationSubmission {
    return this.dIdCommsMessage.presentationsAttach.data.json.presentation_submission;
  }

  public getVerifiableCredentials(): Array<VerifiableCredential> {
    return this.dIdCommsMessage.verifiable_credentials;
  }
}
