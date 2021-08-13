import { PresentationSubmission } from '@sphereon/pe-models';

import {OpenIdConnect} from './models';
import { VerifiableCredential } from './verifiableCredential';
import { VerifiablePresentation } from './verifiablePresentation';

/***
 * OpenId Connect Verifiable Presentation
 */
export class OpenIDConnectVP implements VerifiablePresentation {
  private openIdConnect: OpenIdConnect;

  public getRoot(): OpenIdConnect {
    return this.openIdConnect;
  }

  public getPresentationSubmission(): PresentationSubmission {
    return this.openIdConnect.presentation_submission;
  }

  public getVerifiableCredentials(): Array<VerifiableCredential> {
    return this.openIdConnect._claim_sources;
  }
}
