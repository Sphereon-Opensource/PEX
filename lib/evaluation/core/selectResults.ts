import { OriginalVerifiableCredential } from '@sphereon/ssi-types';

import { Checked, Status } from '../../ConstraintUtils';

import { SubmissionRequirementMatch } from './submissionRequirementMatch';

export interface SelectResults {
  errors?: Checked[];
  matches?: SubmissionRequirementMatch[];
  /**
   * This is the parameter that pex library user should look into to determine what to do next
   * Status can have three values:
   *  1. INFO: everything is fine, you can call `presentationFrom` after this method
   *  2. WARN: method was called with more credentials than required.
   *       To enhance credential holderDID's privacy it is recommended to select credentials which are absolutely required.
   *  3. Error: the credentials you've sent didn't satisfy the requirement defined presentationDefinition object
   */
  areRequiredCredentialsPresent: Status;
  /**
   * All matched/selectable credentials
   */
  verifiableCredential?: OriginalVerifiableCredential[];
  /**
   * Following are indexes of the verifiableCredentials passed to the selectFrom method that have been selected.
   */
  vcIndexes?: number[];
  warnings?: Checked[];
}
