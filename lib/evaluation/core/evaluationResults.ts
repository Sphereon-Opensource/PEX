import { PresentationSubmission } from '@sphereon/pex-models';
import { IPresentation, IVerifiableCredential, OriginalVerifiablePresentation, SdJwtDecodedVerifiableCredential } from '@sphereon/ssi-types';

import { Checked, Status } from '../../ConstraintUtils';

export interface PresentationEvaluationResults extends Omit<EvaluationResults, 'verifiableCredential'> {
  presentations: Array<OriginalVerifiablePresentation | IPresentation>;
}

export interface EvaluationResults {
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
   * List of the errors lines generated during the evaluation process.
   *  In case of evaluateCredentials gets populated with all the errors generated in the process
   *  In case of evaluatePresentation gets populated with errors only if areRequiredCredentialsPresent is set to Status Error
   */
  errors?: Checked[];
  value?: PresentationSubmission;
  verifiableCredential: Array<IVerifiableCredential | SdJwtDecodedVerifiableCredential>;
  warnings?: Checked[];
}
