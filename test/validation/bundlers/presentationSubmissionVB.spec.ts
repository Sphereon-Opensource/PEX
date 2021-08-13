import fs from 'fs';

import { PresentationSubmission } from '@sphereon/pe-models';

import { PresentationSubmissionVB } from "../../../lib";
import { ValidationBundler } from "../../../lib";
import { ValidationEngine } from "../../../lib";
import { Checked, Status } from '../../../lib';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('validate', () => {

  it('should not return error for correct presentation submission', () => {
    const basicPS = getFile('./test/resources/ps_basic.json');

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for missing id', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    delete basicPS.id;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'id should not be empty')]);
  });

  it('should return error for null id', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.id = null;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'id should not be empty')]);
  });

  it('should return error for empty id', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.id = '';

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'id should not be empty')]);
  });

  it('should return error for missing definition_id', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    delete basicPS.definition_id;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'presentation_definition_id should not be empty')]);
  });

  it('should return error for null definition_id', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.definition_id = null;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'presentation_definition_id should not be empty')]);
  });

  it('should return error for empty definition_id', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.definition_id = '';

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'presentation_definition_id should not be empty')]);
  });

  it('should return error for missing purpose', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    delete basicPS.descriptor_map;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'descriptor_map should be a non-empty list')]);
  });

  it('should return error for null purpose', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map = null;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'descriptor_map should be a non-empty list')]);
  });

  it('should return error for empty descriptor_map', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map = [];

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'descriptor_map should be a non-empty list')]);
  });

  it('should return error for missing descriptor id', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    delete basicPS.descriptor_map[0].id;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each descriptor should have a one id in it, on all levels')]);
  });

  it('should return error for null descriptor id', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].id = null;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each descriptor should have a one id in it, on all levels')]);
  });

  it('should return error for empty descriptor id', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].id = '';

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each descriptor should have a one id in it, on all levels')]);
  });

  it('should return error for missing descriptor path', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    delete basicPS.descriptor_map[0].path;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each path should be a valid jsonPath')]);
  });

  it('should return error for null descriptor path', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].path = null;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each path should be a valid jsonPath')]);
  });

  it('should return error for empty descriptor path', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].path = '';

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each path should be a valid jsonPath')]);
  });

  it('should return error for invalid descriptor path', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].path = '^.';

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each path should be a valid jsonPath')]);
  });

  it('should return error for missing descriptor format', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    delete basicPS.descriptor_map[0].format;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each format should be one of the known format')]);
  });

  it('should return error for null descriptor path', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].format = null;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each format should be one of the known format')]);
  });

  it('should return error for empty descriptor path', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].format = '';

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each format should be one of the known format')]);
  });

  it('should return error for invalid descriptor path', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].format = '^.';

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each format should be one of the known format')]);
  });

  it('should return error for invalid nested id', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].path_nested.id = '';

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each descriptor should have a one id in it, on all levels')]);
  });

  it('should return error for invalid nested path', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].path_nested.path = '';

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each path should be a valid jsonPath')]);
  });

  it('should return error for invalid nested format', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].path_nested.format = null;

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each format should be one of the known format')]);
  });

  it('should return error for id in the descriptor to be different in nested objects', () => {
    const basicPS: PresentationSubmission = getFile('./test/resources/ps_basic.json');
    basicPS.descriptor_map[0].path_nested.id = 'a';

    const vb: ValidationBundler<PresentationSubmission> = new PresentationSubmissionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPS}]);
    expect(result).toEqual([new Checked('root.presentation_submission', Status.ERROR, 'each descriptor should have a one id in it, on all levels')]);
  });

});
