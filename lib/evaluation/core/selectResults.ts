import { SubmissionRequirementMatch } from './submissionRequirementMatch';

export interface SelectResults {
  matches?: SubmissionRequirementMatch[];
  warnings?: string[];
}
