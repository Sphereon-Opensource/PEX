import { Rules } from '@sphereon/pex-models';

import { SubmissionRequirementMatch } from '../../../lib';
import { SubmissionRequirementMatchType } from '../../../lib/evaluation/core';

describe('submissionRequirementMatch', () => {
  it('should return ok constructor works correctly', function () {
    const submissionRequirementMatch: SubmissionRequirementMatch = {
      name: 'test srm',
      rule: Rules.All,
      vc_path: ['$.verifiableCredential[1]'],
      from: 'A',
      id: 0,
      type: SubmissionRequirementMatchType.SubmissionRequirement
    };
    expect(submissionRequirementMatch.from).toContain('A');
    expect(submissionRequirementMatch.rule).toBe(Rules.All);
    expect(submissionRequirementMatch.vc_path[0]).toBe('$.verifiableCredential[1]');
  });
});
