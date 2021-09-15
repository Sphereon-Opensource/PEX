import { Rules } from '@sphereon/pe-models';

import { SubmissionRequirementMatch } from '../../../lib';


describe('submissionRequirementMatch', () => {

  it('should return ok constructor works correctly', function () {
    const submissionRequirementMatch: SubmissionRequirementMatch = new SubmissionRequirementMatch(
      "test srm",
      Rules.All,
      1,
      ["$.verifiableCredential[1]"],
      ["A"],
      null
    );
    expect(submissionRequirementMatch.count).toBe(1);
    expect(submissionRequirementMatch.rule).toBe(Rules.All);
    expect(submissionRequirementMatch.matches[0]).toBe("$.verifiableCredential[1]");
  });
});