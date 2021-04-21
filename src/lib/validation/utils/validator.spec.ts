import test from 'ava';

import { Invalid } from './errors';
import { validate } from './validator';

interface Person {
    name?: string
}

test('validate: for basic validation', t => {
    const john : Person = { name: 'john' };

    function personShouldBeNamed(person: Person) : boolean { // Predicate declared separately.
        return person.name !== undefined;
    }

    const result = validate(john, [[personShouldBeNamed, 'Person should be named']]);
    t.deepEqual(result, john, "returns the original object when pass validation");
});

test('validate: for error case', t => {
    const throwException = (): boolean => { throw new Error();};
    const john : Person = {  };
    const result = validate(john, [[throwException, 'Something bad happened']] );
    t.deepEqual(
        result,
        [ new Invalid('Something bad happened')],
        "should have handled exception thrown by validation function as validation failuer i.e. result = Invalid"
    );
});

test('validate: for multiple validations', t => {
    const throwException = (): boolean => { throw new Error();}; // predicate throwing error
    const john : Person = { name: 'john' };
    const result = validate(
        john,
        [
            [(person): boolean => person.name !== undefined, 'Person should be named'], // Inlined predicate
            [throwException, 'This one failed']
        ]);
    t.deepEqual(
        result,
        [ new Invalid('This one failed')],
        "handles a mix of succesful validation and failed validation");
});

test('validate: for validations with multiple errors', t => {
    const throwExceptionForNoReason = (): boolean => { throw new Error('This one failed first'); };
    const throwExceptionForAgainNoReason = (): boolean => { throw new Error('This one failed as well'); };
    const john : Person = { name: 'john' };
    const result = validate(john,
        [
            [(person): boolean => person.name !== undefined, 'Person should be named'],
            [throwExceptionForNoReason, 'This one failed first'],
            [throwExceptionForAgainNoReason, 'This one failed as well']
        ]);

    t.deepEqual(
        result,
        [ new Invalid('This one failed first'), new Invalid('This one failed as well') ],
        "handles a mix of succesful validation and failed validation"
    );
});