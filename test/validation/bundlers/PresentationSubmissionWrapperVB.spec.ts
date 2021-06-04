import fs from 'fs';

import {PresentationSubmission} from '@sphereon/pe-models';

import {PresentationSubmissionWrapperVB} from "../../../lib";
import {ValidationBundler} from "../../../lib";
import {Checked, Status} from '../../../lib';
import {ValidationEngine} from "../../../lib";

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const base = './test/dif_pe_examples/vp/';
const files = fs.readdirSync(base);

describe('validate', () => {

  test.each(files)(
    '.validateKnownExample(%s)',
    (file) => {
      const psWrapper = getFile(base + file);
      const vb: ValidationBundler<unknown> = new PresentationSubmissionWrapperVB('root');
      const result = new ValidationEngine().validate([{bundler: vb, target: psWrapper}]);
      expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
    }
  );

  it('should return error for null object', () => {
    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionWrapperVB('root');
    const result = new ValidationEngine().validate([{bundler: vb, target: null}]);
    expect(result).toEqual([new Checked('root.psWrapper', Status.ERROR, 'ps_wrapper should be non null.')]);
  });

  it('should not return error for presentation submission to be on root level', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/vp_basic.json');
    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionWrapperVB('root');
    const result = new ValidationEngine().validate([{bundler: vb, target: {'presentation_submission': basicPS}}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for presentation submission to be on CHAPI location', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/vp_basic.json');
    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionWrapperVB('root');
    const psWrapper = {'data': {'presentation_submission': basicPS}};
    const result = new ValidationEngine().validate([{bundler: vb, target: psWrapper}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for presentation submission to be on did com location', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/vp_basic.json');
    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionWrapperVB('root');
    const psWrapper = {'presentations~attach':[{'data': {'json': {'presentation_submission': basicPS}}}]};
    const result = new ValidationEngine().validate([{bundler: vb, target: psWrapper}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for presentation submission to be missing on the all the know location', () => {
    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionWrapperVB('root');
    const result = new ValidationEngine().validate([{bundler: vb, target: {}}]);
    expect(result).toEqual([new Checked('root.psWrapper', Status.ERROR, 'presentation submission root object should be one of the known locations')]);
  });

  it('should not return error for correct presentation submission schema', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/vp_basic.json');
    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionWrapperVB('root');
    const psWrapper = {'presentation_submission': basicPS};
    const result = new ValidationEngine().validate([{bundler: vb, target: psWrapper}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for incorrect presentation submission schema', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/vp_basic.json');
    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionWrapperVB('root');
    basicPS['new_filed'] = 'make it invalid obj';
    const psWrapper = {'presentation_submission': basicPS};
    const result = new ValidationEngine().validate([{bundler: vb, target: psWrapper}]);
    expect(result).toEqual([new Checked('root.psWrapper[0]', Status.ERROR, 'presentation_submission should be as per json schema.')]);
  });

});
