import { PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential } from './verifiableCredential';
import { VerifiablePresentation } from './verifiablePresentation';

/***
 * OpenId Connect Verifiable Presentation
 */
export class OpenIDConnectVP implements VerifiablePresentation {

  iss: string;
  sub: string;
  preferred_username: string;
  presentationSubmission: PresentationSubmission
  _claim_names: {
    verified_claims: Array<string>
  }
  "_claim_sources": any;

  public getPresentationSubmission(): PresentationSubmission {
    return this.presentationSubmission;
  }

  public getVerifiableCredentials(): Array<VerifiableCredential> {
    return null;
  }
}
