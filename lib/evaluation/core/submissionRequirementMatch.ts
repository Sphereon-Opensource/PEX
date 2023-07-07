import { Rules } from '@sphereon/pex-models';

export interface SubmissionRequirementMatch {
  name?: string;
  rule: Rules;
  min?: number;
  count?: number;
  max?: number;
  vc_path: string[];
  from?: string;
  from_nested?: SubmissionRequirementMatch[];
}
