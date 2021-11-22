import { Rules } from '@sphereon/pe-models';

export interface SubmissionRequirementMatch {
  name?: string;
  rule: Rules;
  min?: number;
  count?: number;
  max?: number;
  matches: string[];
  from?: string[];
  from_nested?: SubmissionRequirementMatch[];
}
