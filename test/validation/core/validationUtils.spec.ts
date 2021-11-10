import { Validated } from '../../../lib';
import { Checked, hasErrors, Status } from '../../../lib/ConstraintUtils';

describe('validation utils tests', () => {
  it('should return false for array with infos', () => {
    const checked: Validated = [new Checked('random', Status.INFO, 'Hmmm')];
    expect(hasErrors(checked)).toBeFalsy();
  });

  it('for warnings should return false', () => {
    const checked: Validated = [new Checked('random', Status.WARN, 'Hmmm')];
    expect(hasErrors(checked)).toBeFalsy();
  });

  it('for uninitialized message should return false for array with infos', () => {
    const checked: Validated = [new Checked('random', Status.INFO)];
    expect(hasErrors(checked)).toBeFalsy();
  });

  it('should return true for array with errors', () => {
    const errors: Validated = [new Checked('random', Status.ERROR, 'Oops')];
    expect(hasErrors(errors)).toBeTruthy();
  });
});
