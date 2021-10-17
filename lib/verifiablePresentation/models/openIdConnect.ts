import { PresentationSubmission } from '@sphereon/pe-models';

import { VerifiableCredential } from '../SSI.types';

/***
 * OpenId Connect Verifiable Presentation
 */
export interface OpenIdConnect {
  iss: string;
  sub: string;
  preferred_username: string;
  presentation_submission: PresentationSubmission;
  _claim_names: {
    verified_claims: Array<string>;
  };
  holder: string;
  _claim_sources: Array<VerifiableCredential>;
}
