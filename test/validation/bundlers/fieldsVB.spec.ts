import { FieldV1, Optionality } from '@sphereon/pex-models';

import { Checked, Status, ValidationEngine } from '../../../lib';
import { FieldsVB, ValidationBundler } from '../../../lib/validation';

const fieldObjExample: FieldV1 = {
  path: ['$.issuer', '$.vc.issuer', '$.iss'],
  purpose: 'We can only verify bank accounts if they are attested by a trusted bank, auditor or regulatory authority.',
  filter: {
    type: 'string',
    pattern: 'did:example:123|did:example:456',
  },
};

function toChecked(message: string) {
  return [new Checked('root.fields[0]', Status.ERROR, message)];
}

describe('fieldValidator tests', () => {
  it('should report no errors for completely valid field object', () => {
    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjExample] }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should report error for field object without path property', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: undefined,
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('field object "path" property must contain array of valid json paths'));
  });

  it('should report error for field object without valid path array', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: '..',
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('field object "path" property must contain array of valid json paths'));
  });

  it('should report error for field object without valid path array object', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: ['..'],
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('field object "path" property must contain array of valid json paths'));
  });

  // todo: Check why this test is failing
  xit('should report error when field object is not a JSON schema descriptor', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      filter: {
        'type-invalid': 'foo',
        pattern: 'bar invalid',
      },
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('field object "filter" property must be valid json schema'));
  });

  it('should report error when filter is missing while predicate is present.', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      filter: undefined,
      predicate: Optionality.Required,
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('field object must have a "filter" property if "predicate" is present'));
  });

  it('should report error when purpose is an empty string', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      purpose: '',
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('purpose should be a non empty string'));
  });

  it('should report error when predicate value is unknown', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      predicate: 'a',
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('Unknown predicate property'));
  });
});
