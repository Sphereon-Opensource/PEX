import { ConstraintsV1, Directives, Optionality } from '@sphereon/pex-models';

import { Checked, Status } from '../../../lib';
import { ConstraintsVB, ValidationBundler, ValidationEngine } from '../../../lib/validation';

function getTestableConstraint(): ConstraintsV1 {
  return {
    limit_disclosure: Optionality.Required,
    statuses: {
      active: {
        directive: Directives.Allowed,
      },
      suspended: {
        directive: Directives.Required,
      },
      revoked: {
        directive: Directives.Disallowed,
      },
    },
    fields: [
      {
        id: 'fieldID-2021-05-04 00',
        path: ['$.issuer', '$.vc.issuer', '$.iss'],
        purpose: 'We can only verify bank accounts if they are attested by a trusted bank, auditor or regulatory authority.',
        filter: {
          type: 'string',
          pattern: 'did:example:123|did:example:456',
        },
      },
    ],
    subject_is_issuer: Optionality.Required,
    is_holder: [
      {
        field_id: ['fieldID-2021-05-04 00'],
        directive: Optionality.Required,
      },
    ],
    same_subject: [
      {
        field_id: ['fieldID-2021-05-04 00'],
        directive: Optionality.Required,
      },
    ],
  };
}

describe('constraints tests', () => {
  it('There should be no error reported for fully valid constraints object', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: getTestableConstraint() }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('There should be no error reported for a uninitialized constraints', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: null }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('There should be no error reported for uninitialized status', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints!.statuses = undefined;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('There should be no error reported for uninitialized active', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints!.statuses!.active = undefined;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('There should be no error reported for uninitialized status suspended', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints!.statuses!.suspended = undefined;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('There should be no error reported for uninitialized status suspended to be other', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    delete constraints!.statuses!.active;
    delete constraints!.statuses!.revoked;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('There should be no error reported for uninitialized status revoked', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints!.statuses!.revoked = undefined;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('There should be error reported for uninitialized active.directive', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints!.statuses!.active!.directive = undefined;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root.constraints', Status.ERROR, 'status directive should have known value')]);
  });

  it('There should be error reported for uninitialized suspended.directive', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints!.statuses!.suspended!.directive = undefined;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root.constraints', Status.ERROR, 'status directive should have known value')]);
  });

  it('There should be error reported for uninitialized revoked.directive', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints!.statuses!.revoked!.directive = undefined;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root.constraints', Status.ERROR, 'status directive should have known value')]);
  });

  it('There should be error reported for uninitialized fields', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    delete constraints.fields;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([
      new Checked('root.constraints', Status.ERROR, 'field_id must correspond to a present field object id property'),
      new Checked('root.constraints', Status.ERROR, 'field_id must correspond to a present field object id property'),
    ]);
  });

  it('There should be error reported for empty fields', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.fields = [];
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([
      new Checked('root.constraints', Status.ERROR, 'field_id must correspond to a present field object id property'),
      new Checked('root.constraints', Status.ERROR, 'field_id must correspond to a present field object id property'),
    ]);
  });

  it('There should be error reported for subject_is_issuer uninitialized', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    delete constraints.subject_is_issuer;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('There should be no error reported for subject_is_issuer to be other', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints.subject_is_issuer = Optionality.Preferred;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('There should be no error reported for is_holder uninitialized', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    delete constraints.is_holder;
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('There should be no error reported for same_subject[0].field_id empty', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints!.same_subject![0]!.field_id = [];
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('There should be error reported for same_subject[0].field_id object empty', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints!.same_subject![0]!.field_id = [''];
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root.constraints', Status.ERROR, 'field_id must correspond to a present field object id property')]);
  });

  it('There should be error reported for same_subject[0].field_id missing', () => {
    const vb: ValidationBundler<ConstraintsV1> = new ConstraintsVB('root');
    const ve = new ValidationEngine();
    const constraints = getTestableConstraint();
    constraints!.same_subject![0]!.field_id = ['missing_fieldID'];
    const result = ve.validate([{ bundler: vb, target: constraints }]);
    expect(result).toEqual([new Checked('root.constraints', Status.ERROR, 'field_id must correspond to a present field object id property')]);
  });
});
