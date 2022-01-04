import { Checked, Status, ValidationEngine } from '../../../lib';
import { ValidationBundler } from '../../../lib/validation';
import { FrameVB } from '../../../lib/validation/bundlers/frameVB';

const frameObjExample = {
  '@context': {
    '@vocab': 'http://example.org/',
    within: { '@reverse': 'contains' },
  },
  '@type': 'Chapter',
  within: {
    '@type': 'Book',
    within: {
      '@type': 'Library',
    },
  },
};

describe('frameValidator tests', () => {
  it('should report error when frame is array', () => {
    const vb: ValidationBundler<unknown> = new FrameVB('root') as ValidationBundler<unknown>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [frameObjExample] }]);
    expect(result).toEqual([new Checked('root.frame', Status.ERROR, 'frame value is not valid')]);
  });

  it('should report error when frame is not of type object', () => {
    const vb: ValidationBundler<unknown> = new FrameVB('root') as ValidationBundler<unknown>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: 'frame' }]);
    expect(result).toEqual([new Checked('root.frame', Status.ERROR, 'frame value is not valid')]);
  });

  it('should report no error when frame is ok', () => {
    const vb: ValidationBundler<unknown> = new FrameVB('root') as ValidationBundler<unknown>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: frameObjExample }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  /*it('should report error for field object without path property', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: undefined
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('field object "path" property must contain array of valid json paths'));
  });

  it('should report error for field object without valid path array', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: '..'
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('field object "path" property must contain array of valid json paths'));
  });

  it('should report error for field object without valid path array object', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: ['..']
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('field object "path" property must contain array of valid json paths'));
  });

  it('should report error when field object is not a JSON schema descriptor', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      filter: {
        type: 'foo',
        pattern: 'bar invalid'
      }
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
      predicate: Optionality.Required
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('field object must have a "filter" property if "predicate" is present'));
  });

  it('should report error when purpose is an empty string', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      purpose: ''
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('purpose should be a non empty string'));
  });

  it('should report error when predicate value is unknown', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      predicate: 'a'
    };

    const vb: ValidationBundler<FieldV1> = new FieldsVB('root') as ValidationBundler<FieldV1>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [fieldObjInvalid] }]);
    expect(result).toEqual(toChecked('Unknown predicate property'));
  });*/
});
