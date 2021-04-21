import { Field, Optionality } from 'pe-models';

import { ValidationEngine } from '../../../lib';
import { FieldObjectValidator } from '../../../lib/validation/validators/fieldObjectValidator';

const fieldObjExample: Field = {
  path: ['$.issuer', '$.vc.issuer', '$.iss'],
  purpose:
    'We can only verify bank accounts if they are attested by a trusted bank, auditor or regulatory authority.',
  filter: {
    type: 'string',
    pattern: 'did:example:123|did:example:456',
  },
};

const validationEngine: ValidationEngine = new ValidationEngine();
validationEngine.add(new FieldObjectValidator()).target(fieldObjExample);

describe('fieldObjectValidator tests: ', () => {
  it('Valid field object throws no errors', () => {
    expect(validationEngine.validate()).toHaveLength(0);
  });

  it('Field object must include a path property', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: undefined,
    };
    expect(
      validationEngine.target(fieldObjInvalid).validate().length
    ).toBeGreaterThan(0);
  });

  it('Field object path property must have length > 0', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: [],
    };
    expect(
      validationEngine.target(fieldObjInvalid).validate().length
    ).toBeGreaterThan(0);
  });

  it('Field object path property must be an array of JSON paths', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      path: ['$.issuer', 'foo invalid'],
    };
    expect(
      validationEngine.target(fieldObjInvalid).validate().length
    ).toBeGreaterThan(0);
  });

  it('Field object filter property must be a JSON schema descriptor', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      filter: {
        type: 'foo',
        pattern: 'bar invalid',
      },
    };
    expect(
      validationEngine.target(fieldObjInvalid).validate().length
    ).toBeGreaterThan(0);
  });

  it('Field object must include filter property if predicate property is present', () => {
    const fieldObjInvalid = {
      ...fieldObjExample,
      filter: undefined,
      predicate: Optionality.Required,
    };
    expect(
      validationEngine.target(fieldObjInvalid).validate().length
    ).toBeGreaterThan(0);
  });
});
