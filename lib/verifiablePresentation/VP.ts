import { PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential } from './verifiableCredential';
import { VerifiablePresentation } from './verifiablePresentation';

/***
 * Verifiable presentation - generic
 */
export class VP implements VerifiablePresentation {

  context: Array<string>;
  presentationSubmission: PresentationSubmission;
  type: Array<string>;
  verifiableCredential: Array<VerifiableCredential>;
  proof: any;

  public getPresentationSubmission(): PresentationSubmission {
    return this.presentationSubmission;
  }

  public getVerifiableCredentials(): Array<VerifiableCredential> {
    return this.verifiableCredential;
  }
}
