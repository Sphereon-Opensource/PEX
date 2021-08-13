import { PresentationSubmission } from '@sphereon/pe-models';

import {Presentation} from './models';
import { VerifiableCredential } from './verifiableCredential';
import { VerifiablePresentation } from './verifiablePresentation';

/***
 * Verifiable presentation - generic
 */
export class VP implements VerifiablePresentation {
  private presentation: Presentation;

  constructor(pPresentation: Presentation) {
    this.presentation = pPresentation;
  }

  public getRoot(): Presentation {
    return this.presentation;
  }

  public getPresentationSubmission(): PresentationSubmission {
    return this.presentation.presentation_submission;
  }

  public getVerifiableCredentials(): Array<VerifiableCredential> {
    return this.presentation.verifiable_credential;
  }
}
