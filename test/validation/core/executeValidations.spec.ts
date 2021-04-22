import { Invalid } from '../../../lib/validation/core';
import { executeValidations } from '../../../lib/validation/core';

interface Person {
  name?: string;
}

describe('validator its', () => {
  it('returns the original object when pass validation', () => {
    const john: Person = { name: 'john' };

    function personShouldBeNamed(person: Person): boolean {
      // Predicate declared separately.
      return person.name !== undefined;
    }

    const result = executeValidations(john, [
      [personShouldBeNamed, 'Person should be named'],
    ]);
    expect(result).toEqual(john);
  });

  it('should have handled exception thrown by validation function as validation failure i.e. result = Invalid', () => {
    const throwException = (): boolean => {
      throw new Error();
    };
    const john: Person = {};
    const result = executeValidations(john, [[throwException, 'Something bad happened']]);
    expect(result).toEqual([new Invalid('Something bad happened', new Error())]);
  });

  it('handles a mix of successful validation and failed validation', () => {
    const throwException = (): boolean => {
      throw new Error();
    }; // predicate throwing error
    const john: Person = { name: 'john' };
    const result = executeValidations(john, [
      [
        (person): boolean => person.name !== undefined,
        'Person should be named',
      ], // Inlined predicate
      [throwException, 'This one failed'],
    ]);
    expect(result).toEqual([new Invalid('This one failed', new Error())]);
  });

  it('handles a mix of successful validation and failed validation', () => {
    const throwExceptionForNoReason = (): boolean => {
      throw new Error('This one failed first');
    };
    const throwExceptionForAgainNoReason = (): boolean => {
      throw new Error('This one failed as well');
    };
    const john: Person = { name: 'john' };
    const result = executeValidations(john, [
      [
        (person): boolean => person.name !== undefined,
        'Person should be named',
      ],
      [throwExceptionForNoReason, 'This one failed first'],
      [throwExceptionForAgainNoReason, 'This one failed as well'],
    ]);

    expect(result).toEqual([
      new Invalid('This one failed first', new Error('This one failed first')),
      new Invalid('This one failed as well', new Error('This one failed as well')),
    ]);
  });
});
