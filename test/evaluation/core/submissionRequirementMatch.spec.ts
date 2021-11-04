import { Rules } from '@sphereon/pe-models';

import { SubmissionRequirementMatch } from '../../../lib';


describe('submissionRequirementMatch', () => {

  it('should return ok constructor works correctly', function () {
    const submissionRequirementMatch: SubmissionRequirementMatch = {
      name: "test srm",
      rule: Rules.All,
      matches: ["$.verifiableCredential[1]"],
      from: ["A"]
    };
    expect(submissionRequirementMatch.from).toContain("A");
    expect(submissionRequirementMatch.rule).toBe(Rules.All);
    expect(submissionRequirementMatch.matches[0]).toBe("$.verifiableCredential[1]");
  });
});