import test, { ExecutionContext } from 'ava';
import { Field } from 'pe-models';

import { FieldObjectValidator } from './fieldObjectValidator';

import ValidationEngine from './index';

import PredicateEnum = Field.PredicateEnum;

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

test('Valid field object throws no errors', (t: ExecutionContext) => {
  t.is(validationEngine.validate().length, 0);
});

test('Field object must include a path property', (t: ExecutionContext) => {
  const fieldObjInvalid = {
    ...fieldObjExample,
    path: undefined,
  };
  t.assert(validationEngine.target(fieldObjInvalid).validate().length > 0);
});

test('Field object path property must have length > 0', (t: ExecutionContext) => {
  const fieldObjInvalid = {
    ...fieldObjExample,
    path: [],
  };
  t.assert(validationEngine.target(fieldObjInvalid).validate().length > 0);
});

test('Field object path property must be an array of JSON paths', (t: ExecutionContext) => {
  const fieldObjInvalid = {
    ...fieldObjExample,
    path: ['$.issuer', 'foo invalid'],
  };
  t.assert(validationEngine.target(fieldObjInvalid).validate().length > 0);
});

test('Field object filter property must be a JSON schema descriptor', (t: ExecutionContext) => {
  const fieldObjInvalid = {
    ...fieldObjExample,
    filter: {
      type: 'foo',
      pattern: 'bar invalid',
    },
  };
  t.assert(validationEngine.target(fieldObjInvalid).validate().length > 0);
});

test('Field object must include filter property if predicate property is present', (t: ExecutionContext) => {
  const fieldObjInvalid = {
    ...fieldObjExample,
    filter: undefined,
    predicate: PredicateEnum.Required,
  };
  t.assert(validationEngine.target(fieldObjInvalid).validate().length > 0);
});
