import { Checked } from '../../ConstraintUtils';
import { VerifiableCredential } from '../../verifiablePresentation';

import { SubmissionRequirementMatch } from './submissionRequirementMatch';

export interface SelectResults {
  errors?: Checked[];
  matches?: SubmissionRequirementMatch[];
  verifiableCredentials?: VerifiableCredential[];
  warnings?: Checked[];
}
