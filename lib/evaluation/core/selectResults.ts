import { Checked } from '../../ConstraintUtils';

import { SubmissionRequirementMatch } from './submissionRequirementMatch';

export interface SelectResults {
  matches?: SubmissionRequirementMatch[];
  warnings?: Checked[];
}
