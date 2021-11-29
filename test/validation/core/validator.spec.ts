import { Checked, Status } from '../../../lib';
import { validate } from '../../../lib/validation';

function toChecked(message: string) {
  return new Checked('person.name', Status.ERROR, message);
}

describe('validation utils tests', () => {
  it('validate: for basic validation', () => {
    function personShouldBeNamed(personName: string): boolean {
      // Predicate declared separately.
      return personName !== undefined;
    }

    const results = validate([
      {
        tag: 'person.name',
        target: 'john',
        predicate: personShouldBeNamed,
        message: 'Person should be named',
      },
    ]);
    expect(results).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should have handled exception thrown by validation function as validation failure i.e. result = Invalid', () => {
    const throwException = (): boolean => {
      throw new Error();
    };
    const personName = '';
    const result = validate([
      {
        tag: 'person.name',
        target: personName,
        predicate: throwException,
        message: 'Something bad happened',
      },
    ]);
    expect(result).toEqual([toChecked('Something bad happened')]);
  });

  it('handles a mix of successful validation and failed validation', () => {
    const throwException = (): boolean => {
      throw new Error();
    }; // predicate throwing error
    const personName = 'john';
    const result = validate([
      {
        tag: 'person.name',
        target: personName,
        predicate: (p): boolean => p !== undefined,
        message: 'Person should be named', // Inlined predicate
      },
      {
        tag: 'person.name',
        target: personName,
        predicate: throwException,
        message: 'This one failed',
      },
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
    const personName = 'john';
    const result = validate([
      {
        tag: 'person.name',
        target: personName,
        predicate: (name): boolean => name !== undefined,
        message: 'Person should be named',
      },
      {
        tag: 'person.name',
        target: personName,
        predicate: throwExceptionForNoReason,
        message: 'This one failed first',
      },
      {
        tag: 'person.name',
        target: personName,
        predicate: throwExceptionForAgainNoReason,
        message: 'This one failed as well',
      },
    ]);

    expect(result).toEqual([toChecked('This one failed first'), toChecked('This one failed as well')]);
  });
});
