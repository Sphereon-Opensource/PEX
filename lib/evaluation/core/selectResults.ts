import { Checked } from '../../ConstraintUtils';
import { VerifiableCredential } from '../../verifiablePresentation';

import { SubmissionRequirementMatch } from './submissionRequirementMatch';

export interface SelectResults {
  errors?: Checked[];
  matches?: SubmissionRequirementMatch[];
  verifiableCredentials?: VerifiableCredential[];
  /**
   * Following are indexes of the verifiableCredentials passed to the selectFrom method that have been selected.
   */
  vcIndexes?: number[];
  warnings?: Checked[];
}
