import { Rules } from '@sphereon/pe-models';

export interface SubmissionRequirementMatch {
  name: string;
  rule: Rules;
  count: number;
  matches: any[]; // VerifiableCredential
  from?: string[];
  from_nested?: SubmissionRequirementMatch[];
}

export const SubmissionRequirementMatch = class implements SubmissionRequirementMatch {
  public name: string;
  public rule: Rules;
  public count: number;
  public matches: any[]; // this can be later changed to VerifiableCredentials
  public from?: string[];
  public from_nested?: SubmissionRequirementMatch[];

  public constructor(
    name: string,
    rule: Rules,
    count: number,
    matches: any[],
    from?: string[],
    from_nested?: SubmissionRequirementMatch[]
  ) {
    this.name = name;
    this.rule = rule;
    this.count = count;
    this.matches = matches;
    this.from = from;
    this.from_nested = from_nested;
  }
};
