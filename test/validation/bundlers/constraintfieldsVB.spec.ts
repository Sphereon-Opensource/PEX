import {Constraints, Directives, Optionality} from 'pe-models';

import {Checked, ConstraintsVB, Status, ValidationBundler, ValidationEngine} from '../../../lib';

function getTestableConstraint(): Constraints {
  return {
    "limit_disclosure": Optionality.Required,
    "statuses": {
      "active": {
        "directive": Directives.Allowed
      },
      "suspended": {
        "directive": Directives.Required
      },
      "revoked": {
        "directive": Directives.Disallowed
      }
    },
    "fields": [
      {
        path: ['$.issuer', '$.vc.issuer', '$.iss'],
        purpose:
          'We can only verify bank accounts if they are attested by a trusted bank, auditor or regulatory authority.',
        filter: {
          type: 'string',
          pattern: 'did:example:123|did:example:456',
        },
      }
    ],
    "subject_is_issuer": Optionality.Required,
    "is_holder": [
      {
        "field_id": [
          "item1",
          "item2"
        ],
        "directive": Optionality.Required
      }
    ],
    "same_subject": [
      {
        "field_id": [
          "item3",
          "item4"
        ],
        "directive": Optionality.Required,
      }
    ]
  };
}

describe('constraints tests', () => {

  it('There should be no error reported', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([{bundler: vb, target: getTestableConstraint()}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for a uninitialized constraints', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([{bundler: vb, target: null}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for uninitialized status', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.statuses = null;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for uninitialized active', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.statuses.active = null;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for uninitialized status suspended', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.statuses.suspended = null;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for uninitialized status suspended to be other', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.statuses.active = undefined;
    constraints.statuses.revoked = undefined;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for uninitialized status revoked', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.statuses.revoked = null;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for uninitialized active.directive', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.statuses.active.directive = null;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root.constraints', Status.ERROR, 'status directive should have known value')],);
  });

  it('There should be no error reported for uninitialized suspended.directive', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.statuses.suspended.directive = null;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root.constraints', Status.ERROR, 'status directive should have known value')],);
  });

  it('There should be no error reported for uninitialized revoked.directive', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.statuses.revoked.directive = null;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root.constraints', Status.ERROR, 'status directive should have known value')],);
  });

  it('There should be no error reported for uninitialized fields', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.fields = undefined;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for empty fields', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.fields = [];
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for subject_is_issuer uninitialized', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.subject_is_issuer = undefined;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for subject_is_issuer to be other', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.subject_is_issuer = Optionality.Preferred;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for is_holder uninitialized', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.is_holder = undefined;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for is_holder[0].directive uninitialized', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.is_holder[0].directive = undefined;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for is_holder[0].field_id uninitialized', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.is_holder[0].field_id = undefined;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root.constraints', Status.ERROR, 'is_holder should be of correct structure')],);
  });

  it('There should be no error reported for same_subject[0].directive uninitialized', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.same_subject[0].directive = undefined;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for same_subject[0].field_id uninitialized', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.same_subject[0].field_id = undefined;
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root.constraints', Status.ERROR, 'subject should be of correct structure')],);
  });

  it('There should be no error reported for same_subject[0].field_id empty', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.same_subject[0].field_id = [];
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('There should be no error reported for same_subject[0].field_id empty', () => {
    const vb: ValidationBundler<Constraints> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.same_subject[0].field_id = [''];
    const result = ve.validate([{bundler: vb, target: constraints}]);
    expect(result).toEqual([new Checked('root.constraints', Status.ERROR, 'subject should be of correct structure')],);
  });

});