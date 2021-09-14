import { Checked } from '../../ConstraintUtils';

import { SubmissionRequirementMatch } from './submissionRequirementMatch';

export interface SelectResults {
  errors?: Checked[];
  matches?: SubmissionRequirementMatch[];
  warnings?: Checked[];
}
