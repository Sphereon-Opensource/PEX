import { PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential } from './SSI.types';
import { OpenIdConnect } from './models';
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

  //TODO: might need a bit of refactoring
  getHolder(): string {
    return this.openIdConnect.holder;
  }
}
