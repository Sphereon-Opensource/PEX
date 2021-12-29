import { PresentationSubmission } from '@sphereon/pex-models';

import { Checked } from '../ConstraintUtils';
import { InternalVerifiableCredential } from '../types';

export interface EvaluationResults {
  value?: PresentationSubmission;
  warnings?: Checked[];
  errors?: Checked[];
  verifiableCredential: InternalVerifiableCredential[];
}
