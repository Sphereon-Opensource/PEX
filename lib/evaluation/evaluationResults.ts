import { PresentationSubmission } from '@sphereon/pe-models';

import { Checked } from '../ConstraintUtils';
import { VerifiableCredential } from '../types';

export interface EvaluationResults {
  value?: PresentationSubmission;
  warnings?: Checked[];
  errors?: Checked[];
  verifiableCredential: VerifiableCredential[];
}
