import { PresentationSubmission } from '@sphereon/pe-models';
import { Warn } from './warn';

export interface EvaluationResults {
  value?: PresentationSubmission;
  warnings?: Warn[];
  errors?: Error[];
}
