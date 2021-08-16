import { PresentationSubmission } from '@sphereon/pe-models';

import { Checked } from '../ConstraintUtils';

export interface EvaluationResults {
  value?: PresentationSubmission;
  warnings?: Checked[];
  errors?: Checked[];
}
