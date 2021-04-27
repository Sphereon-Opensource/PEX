import {SubmissionRequirement} from "pe-models";

import {SubmissionRequirementVB} from "../../../lib";
import {ValidationBundler} from "../../../lib";
import {Checked, Status} from '../../../lib';
import {ValidationEngine} from "../../../lib";

describe('validate', () => {

  it('There should be no error', () => {
    const srs: SubmissionRequirement[] = [{
      rule: 'all',
      from: 'B'
    }]

    const vb: ValidationBundler<SubmissionRequirement> = new SubmissionRequirementVB('pd');

    const result = new ValidationEngine().validate([[vb, srs]]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('for rule pick there should be no error', () => {
    const srs: SubmissionRequirement[] = [{
      rule: 'pick',
      from_nested: []
    }]

    const vb: ValidationBundler<SubmissionRequirement> = new SubmissionRequirementVB('pd');

    const result = new ValidationEngine().validate([[vb, srs]]);
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

    const result = new ValidationEngine().validate([[vb, srs]]);
    expect(result).toEqual([
      new Checked('pd.srs[0]', Status.ERROR, 'count must be a practical positive number'),
      new Checked('pd.srs[0]', Status.ERROR, 'min must be a practical positive number'),
      new Checked('pd.srs[0]', Status.ERROR, 'max must be a practical positive number'),
      new Checked('pd.srs[0].from_nested.srs[0]', Status.ERROR, 'min must be a practical positive number'),
      new Checked('pd.srs[1]', Status.ERROR, 'needs exactly one of from and from_nested'),
      new Checked('pd.srs[1]', Status.ERROR, 'max must be a practical positive number'),
    ]);
  });

});
