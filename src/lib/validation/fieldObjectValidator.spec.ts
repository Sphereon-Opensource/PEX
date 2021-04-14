import test, { ExecutionContext } from 'ava';
import { Field, FieldPredicateEnum } from 'pe-models';

import { ValidationError } from './errors/validationError';
import { FieldObjectValidator } from './fieldObjectValidator';

const fieldObjValidator: FieldObjectValidator = new FieldObjectValidator();
const fieldObjExample: Field = {
  path: ['$.issuer', '$.vc.issuer', '$.iss'],
  purpose:
    'We can only verify bank accounts if they are attested by a trusted bank, auditor or regulatory authority.',
  filter: {
    type: 'string',
    pattern: 'did:example:123|did:example:456',
  },
};

test('Valid field object throws no errors', (t: ExecutionContext) => {
  t.notThrows(() => fieldObjValidator.validate(fieldObjExample));
});

test('Field object must include a path property', (t: ExecutionContext) => {
  const fieldObjInvalid = {
    ...fieldObjExample,
    path: undefined,
  };
  t.throws(() => fieldObjValidator.validate(fieldObjInvalid), {
    instanceOf: ValidationError,
  });
});

test('Field object path property must have length > 0', (t: ExecutionContext) => {
  const fieldObjInvalid = {
    ...fieldObjExample,
    path: [],
  };
  t.throws(() => fieldObjValidator.validate(fieldObjInvalid), {
    instanceOf: ValidationError,
  });
});

test('Field object path property must be an array of JSON paths', (t: ExecutionContext) => {
  const fieldObjInvalid = {
    ...fieldObjValidator,
    path: ['$.issuer', 'foo invalid'],
  };
  t.throws(() => fieldObjValidator.validate(fieldObjInvalid), {
    instanceOf: ValidationError,
  });
});

test('Field object filter property must be a JSON schema descriptor', (t: ExecutionContext) => {
  const fieldObjInvalid = {
    ...fieldObjExample,
    filter: {
      type: 'foo',
      pattern: 'bar invalid',
    },
  };

  t.throws(() => fieldObjValidator.validate(fieldObjInvalid), {
    instanceOf: ValidationError,
  });
});

test('Field object must include filter property if predicate property is present', (t: ExecutionContext) => {
  const fieldObjInvalid = {
    ...fieldObjExample,
    filter: undefined,
    predicate: 'required' as FieldPredicateEnum,
  };
  t.throws(() => fieldObjValidator.validate(fieldObjInvalid), {
    instanceOf: ValidationError,
  });
});
