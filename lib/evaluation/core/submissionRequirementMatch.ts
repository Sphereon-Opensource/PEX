import { Rules } from '@sphereon/pex-models';

export interface SubmissionRequirementMatch {
  name?: string;
  purpose?: string;
  rule: Rules;
  min?: number;
  count?: number;
  max?: number;
  vc_path: string[];
  input_descriptor_path: string[];
  matches: Record<string, string>;
  from?: string[];
  from_nested?: SubmissionRequirementMatch[];
}
