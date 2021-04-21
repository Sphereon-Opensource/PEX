import test from 'ava';

import { Invalid, NonEmptyArray } from './errors';
import { areInvalid } from './validationUtils';

test('AreErrors: for invalids', t => {
    const myErrors : NonEmptyArray<Invalid> = [ new Invalid('Oops') ];
    t.true(areInvalid(myErrors), "returns true for array of Invalids");
});

test('AreErrors: for objects with error messages', t => {
    const myErrors : NonEmptyArray<Invalid> = [ { errorMessage: 'Oops'} ];
    t.true(areInvalid(myErrors), "returns true for array of objects that has data structure matching Invalid class");
});

test('AreErrors: for null errorMessages', t => {
    const myErrors : NonEmptyArray<Invalid> = [ { errorMessage: null} ];
    t.false(areInvalid(myErrors), "returns true for null message");
});
