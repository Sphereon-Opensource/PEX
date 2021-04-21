import {
  areInvalid,
  Invalid,
  NonEmptyArray,
} from '../../../lib/validation/core';

describe('returns true for array of Invalids', () => {
  it('AreErrors: for invalids', () => {
    const myErrors: NonEmptyArray<Invalid> = [new Invalid('Oops')];
    expect(areInvalid(myErrors)).toBe(true);
  });

  it('returns true for array of objects that has data structure matching Invalid class', () => {
    const myErrors: NonEmptyArray<Invalid> = [{ errorMessage: 'Oops' }];
    expect(areInvalid(myErrors)).toBe(true);
  });

  it('returns false for null message', () => {
    const myErrors: NonEmptyArray<Invalid> = [{ errorMessage: null }];
    expect(areInvalid(myErrors)).toBe(false);
  });
});
