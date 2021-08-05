import { PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential } from './verifiableCredential';
import { VerifiablePresentation } from './verifiablePresentation';

/***
 * Credential Handler API Verifiable Presentation
 */
export class CHAPIVP implements VerifiablePresentation {

  type: string;
  dataType: string;
  data: {
    presentationSubmission: PresentationSubmission
  };
  verifiableCredential: Array<VerifiableCredential>;
  proof: any;

  public getPresentationSubmission(): PresentationSubmission {
    return undefined;
  }

  public getVerifiableCredentials(): Array<VerifiableCredential> {
    return undefined;
  }
}
