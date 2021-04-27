import {Field, Optionality} from 'pe-models';

import {FieldObjectVB} from '../../../lib';
import {ValidationBundler} from "../../../lib";
import {Checked, Status} from '../../../lib';
import {ValidationEngine} from '../../../lib';

const fieldObjExample: Field = {
  path: ['$.issuer', '$.vc.issuer', '$.iss'],
  purpose:
    'We can only verify bank accounts if they are attested by a trusted bank, auditor or regulatory authority.',
  filter: {
    type: 'string',
    pattern: 'did:example:123|did:example:456',
  },
};

function toChecked(message: string) {
  return new Checked('root.field', Status.ERROR, message);
}

describe('fieldObjectValidator tests', () => {
  it('There should be no error reported', () => {
    const vb: ValidationBundler<Field> = new FieldObjectVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([[vb, fieldObjExample]]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('Field object must include a path property', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: undefined,
    };

    const vb: ValidationBundler<Field> = new FieldObjectVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([[vb, fieldObjInvalid]]);
    expect(result).toEqual([
      toChecked('field object "path" property must contain array of valid json paths')
    ]);
  });

  it('Field object must include a valid path property', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: '..',
    };

    const vb: ValidationBundler<Field> = new FieldObjectVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([[vb, fieldObjInvalid]]);
    expect(result).toEqual([
      toChecked('field object "path" property must contain array of valid json paths')
    ]);
  });

  it('Field object must include a valid path property', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: ['..'],
    };

    const vb: ValidationBundler<Field> = new FieldObjectVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([[vb, fieldObjInvalid]]);
    expect(result).toEqual([
      toChecked('field object "path" property must contain array of valid json paths')
    ]);
  });

  it('Field object filter property must be a JSON schema descriptor', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      filter: {
        type: 'foo',
        pattern: 'bar invalid',
      },
    };

    const vb: ValidationBundler<Field> = new FieldObjectVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([[vb, fieldObjInvalid]]);
    expect(result).toEqual([toChecked('field object "filter" property must be valid json schema')]);
  });

  it('Field object must include filter property if predicate property is present', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      filter: undefined,
      predicate: Optionality.Required,
    };

    const vb: ValidationBundler<Field> = new FieldObjectVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([[vb, fieldObjInvalid]]);
    expect(result).toEqual(
      [toChecked('field object must have a "filter" property if "predicate" is present')]);
  });
});