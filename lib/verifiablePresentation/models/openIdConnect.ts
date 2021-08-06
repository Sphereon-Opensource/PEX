import { PresentationSubmission } from '@sphereon/pe-models';

/***
 * OpenId Connect Verifiable Presentation
 */
export class OpenIdConnect {
  iss: string;
  sub: string;
  preferred_username: string;
  presentation_submission: PresentationSubmission;
  _claim_names: {
    verified_claims: Array<string>;
  };
  '_claim_sources': any;
}
