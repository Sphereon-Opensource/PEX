import {Checked, Status} from '../../../lib';
import {validate} from '../../../lib';

interface Person {
  name?: string
}

function toChecked(message: string) {
  return new Checked('person.name', Status.ERROR, message);
}

describe('validation utils tests', () => {
  it('validate: for basic validation', () => {
    const john: Person = {name: 'john'};

    function personShouldBeNamed(person: Person): boolean { // Predicate declared separately.
      return person.name !== undefined;
    }

    const results = validate([['person.name', john, personShouldBeNamed, 'Person should be named']]);
    expect(results).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should have handled exception thrown by validation function as validation failure i.e. result = Invalid', () => {
    const throwException = (): boolean => {
      throw new Error();
    };
    const john: Person = {};
    const result = validate([['person.name', john, throwException, 'Something bad happened']]);
    expect(result).toEqual([toChecked('Something bad happened')]);
  });

  it('handles a mix of successful validation and failed validation', () => {
    const throwException = (): boolean => {
      throw new Error();
    }; // predicate throwing error
    const john: Person = {name: 'john'};
    const result = validate(
      [
        ['person.name', john, (p): boolean => p.name !== undefined, 'Person should be named'], // Inlined predicate
        ['person.name', john, throwException, 'This one failed']
      ]);
    expect(result).toEqual([toChecked('This one failed')]);
  });

  it('handles a mix of successful validation and failed validation for multiple errors', () => {
    const throwExceptionForNoReason = (): boolean => {
      throw new Error('This one failed first');
    };
    const throwExceptionForAgainNoReason = (): boolean => {
      throw new Error('This one failed as well');
    };
    const john: Person = {name: 'john'};
    const result = validate(
      [
        ['person.name', john, (person): boolean => person.name !== undefined, 'Person should be named'],
        ['person.name', john, throwExceptionForNoReason, 'This one failed first'],
        ['person.name', john, throwExceptionForAgainNoReason, 'This one failed as well']
      ]);

    expect(result).toEqual(
      [
        toChecked('This one failed first'),
        toChecked('This one failed as well')
      ]);
  });
});