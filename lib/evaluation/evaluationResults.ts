import { PresentationSubmission } from '@sphereon/pex-models';

import { Checked } from '../ConstraintUtils';
import { VerifiableCredential } from '../types/SSI.types';

export interface EvaluationResults {
  value?: PresentationSubmission;
  warnings?: Checked[];
  errors?: Checked[];
  verifiableCredential: VerifiableCredential[];
}
