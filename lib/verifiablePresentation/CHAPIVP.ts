import { PresentationSubmission } from '@sphereon/pe-models';

import { Chapi } from './models';
import { VerifiableCredential } from './verifiableCredential';
import { VerifiablePresentation } from './verifiablePresentation';

/***
 * Credential Handler API Verifiable Presentation
 */
export class CHAPIVP implements VerifiablePresentation {
  private chapi: Chapi;

  public getRoot(): Chapi {
    return this.chapi;
  }

  public getPresentationSubmission(): PresentationSubmission {
    return this.chapi.data.presentation_submission;
  }

  public getVerifiableCredentials(): Array<VerifiableCredential> {
    return this.chapi.verifiable_credential;
  }

  getHolder(): string {
    return this.chapi.holder;
  }
}
