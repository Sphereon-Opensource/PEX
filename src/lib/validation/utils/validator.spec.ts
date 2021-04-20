import test from 'ava';

import { Invalid, InvalidOr } from './errors';
import { Validation, validate } from './validator';

interface Person {
    name?: string
}

const personShouldBeNamed: Validation<Person> = (person): InvalidOr<Person> =>
    person.name !== undefined ? person : new Invalid('Name not present');


test('validate: for basic validation', t => {
    const john : Person = { name: 'john' };
    const result = validate([personShouldBeNamed], john);
    t.deepEqual(result, john, "returns the original object when pass validation");
});

test('validate: for error case', t => {
    const throwException = (): InvalidOr<Person> => { throw new Error('Something bad happened'); };
    const john : Person = {  };
    const result = validate([throwException], john);
    t.deepEqual(
        result,
        [ new Invalid('Something bad happened')],
        "handles exception thrown by validation function as Invalid"
    );
});

test('validate: for multiple validations', t => {
    const throwException = (): InvalidOr<Person> => { throw new Error('This one failed'); };
    const john : Person = { name: 'john' };
    const result = validate([personShouldBeNamed, throwException], john);
    t.deepEqual(
        result,
        [ new Invalid('This one failed')],
        "handles a mix of succesful validation and failed validation");
});

test('validate: for validations with multiple errors', t => {
    const throwExceptionForNoReason = (): InvalidOr<Person> => { throw new Error('This one failed first'); };
    const throwExceptionForAgainNoReason = (): InvalidOr<Person> => { throw new Error('This one failed as well'); };
    const john : Person = { name: 'john' };
    const result = validate([personShouldBeNamed, throwExceptionForNoReason, throwExceptionForAgainNoReason], john);

    t.deepEqual(
        result,
        [ new Invalid('This one failed first'), new Invalid('This one failed as well') ],
        "handles a mix of succesful validation and failed validation"
    );
});