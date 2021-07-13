import { SubmissionRequirement } from '@sphereon/pe-models';

import { SubmissionRequirementVB } from "../../../lib";
import { ValidationBundler } from "../../../lib";
import { ValidationEngine } from "../../../lib";
import { Checked, Status } from '../../../lib/ConstraintUtils';

describe('validate', () => {

  it('There should be no error', () => {
    const srs: SubmissionRequirement[] = [{
      rule: 'all',
      from: 'B'
    }]

    const vb: ValidationBundler<SubmissionRequirement> = new SubmissionRequirementVB('pd');

    const result = new ValidationEngine().validate([{bundler: vb, target: srs}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('for rule pick there should be no error', () => {
    const srs: SubmissionRequirement[] = [{
      rule: 'pick',
      from_nested: []
    }]

    const vb: ValidationBundler<SubmissionRequirement> = new SubmissionRequirementVB('pd');

    const result = new ValidationEngine().validate([{bundler: vb, target: srs}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('for multiple errors', () => {
    const srs: SubmissionRequirement[] = [{
      rule: 'pick',
      min: -3,
      max: -2,
      count: -1,
      from_nested: [
        {
          rule: 'pick',
          min: -1,
          from: 'someGroup'
        },
        {
          rule: 'all',
          min: 1,
          max: 3,
          count: 2,
          from: 'someGroup2'
        }
      ]
    },
      {
        rule: 'pick',
        max: -1
      }
    ];

    const vb: ValidationBundler<SubmissionRequirement> = new SubmissionRequirementVB('pd');

    const result = new ValidationEngine().validate([{bundler: vb, target: srs}]);
    expect(result).toEqual([
      new Checked('pd.submission_requirements[0]', Status.ERROR, 'count must be a practical positive number'),
      new Checked('pd.submission_requirements[0]', Status.ERROR, 'min must be a practical positive number'),
      new Checked('pd.submission_requirements[0]', Status.ERROR, 'max must be a practical positive number'),
      new Checked('pd.submission_requirements[0].from_nested.submission_requirements[0]', Status.ERROR, 'min must be a practical positive number'),
      new Checked('pd.submission_requirements[1]', Status.ERROR, 'needs exactly one of from or from_nested'),
      new Checked('pd.submission_requirements[1]', Status.ERROR, 'max must be a practical positive number'),
    ]);
  });

});
