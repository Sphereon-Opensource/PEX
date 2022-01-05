import { Checked, Status, ValidationEngine } from '../../../lib';
import { ValidationBundler } from '../../../lib/validation';
import { FrameVB } from '../../../lib/validation/bundlers/frameVB';

const frameObjExample = {
  '@context': {
    '@vocab': 'http://example.org/',
    within: { '@reverse': 'contains' },
  },
  '@type': 'Chapter',
  within: {
    '@type': 'Book',
    within: {
      '@type': 'Library',
    },
  },
};

describe('frameValidator tests', () => {
  it('should report error when frame is array', () => {
    const vb: ValidationBundler<unknown> = new FrameVB('root') as ValidationBundler<unknown>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: [frameObjExample] }]);
    expect(result).toEqual([new Checked('root.frame', Status.ERROR, 'frame value is not valid')]);
  });

  it('should report error when frame is not of type object', () => {
    const vb: ValidationBundler<unknown> = new FrameVB('root') as ValidationBundler<unknown>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: 'frame' }]);
    expect(result).toEqual([new Checked('root.frame', Status.ERROR, 'frame value is not valid')]);
  });

  it('should report no error when frame is ok', () => {
    const vb: ValidationBundler<unknown> = new FrameVB('root') as ValidationBundler<unknown>;
    const ve = new ValidationEngine();
    const result = ve.validate([{ bundler: vb, target: frameObjExample }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });
});
