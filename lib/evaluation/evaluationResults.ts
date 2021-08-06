import { PresentationSubmission } from '@sphereon/pe-models';

export interface EvaluationResults {
  value?: PresentationSubmission;
  warnings?: string[];
  errors?: Error[];
}
