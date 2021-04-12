import test, {ExecutionContext} from 'ava';
import {FieldObjectValidator} from './fieldObjectValidator';

const fieldObjValidator: FieldObjectValidator = new FieldObjectValidator();
const fieldObjExample: any = {
    path: ['$.issuer', '$.vc.issuer', '$.iss'],
    purpose: 'We can only verify bank accounts if they are attested by a trusted bank, auditor or regulatory authority.',
    filter: {
        type: 'string',
        pattern: 'did:example:123|did:example:456'
    }
};

test('Field object must include a path property', (t: ExecutionContext) => {
    const fieldObjInvalid = {
        ...fieldObjExample,
        path: undefined,
    };
    t.is(fieldObjValidator.validate(fieldObjInvalid), false);
});

test('Field object path property must be an array', (t: ExecutionContext) => {
    const fieldObjInvalid = {
        ...fieldObjExample,
        path: '$.issuer'
    };
    t.is(fieldObjValidator.validate(fieldObjInvalid), false);
});

test('Field object path property must have length > 0', (t: ExecutionContext) => {
    const fieldObjInvalid = {
        ...fieldObjExample,
        path: []
    };
    t.is(fieldObjValidator.validate(fieldObjInvalid), false);
});

test('Field object path property must be an array of JSON paths', (t: ExecutionContext) => {
    const fieldObjInvalid = {
        ...fieldObjValidator,
        path: ['$.issuer', 'foo', 'bar']
    }
    t.is(fieldObjValidator.validate(fieldObjInvalid), false);
});

test('Field object filter property must be a JSON schema descriptor', (t: ExecutionContext) => {
    const fieldObjInvalid = {
        ...fieldObjValidator,
        filter: 'foo'
    }
    t.is(fieldObjValidator.validate(fieldObjInvalid), false);
});
