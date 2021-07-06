import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { PresentationDefinitionVB } from "../../../lib";
import { ValidationBundler } from "../../../lib";
import { Checked, Status } from '../../../lib/ConstraintUtils';
import { ValidationEngine } from "../../../lib";


function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const base = './test/dif_pe_examples/pd/';
const files = fs.readdirSync(base);

describe('validate', () => {

  test.each(files)(
    '.validateKnownExample(%s)',
    (file) => {
      const basicPD = getFile(base + file);

      const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

      const result = new ValidationEngine().validate([{bundler: vb, target: basicPD.presentation_definition}]);
      expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
    }
  );

  it('should return error for missing id', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    delete basicPD.id;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'id should not be empty')]);
  });

  it('should return error for null id', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.id = null;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'id should not be empty')]);
  });

  it('should return error for empty id', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.id = '';

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'id should not be empty')]);
  });

  it('should not return error for missing name', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    delete basicPD.name;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for null name', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.name = null;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for empty name', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.name = '';

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'name should be a non-empty string')]);
  });

  it('should not return error for missing purpose', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    delete basicPD.purpose;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for null purpose', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.purpose = null;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for empty purpose', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.purpose = '';

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'purpose should be a non-empty string')]);
  });

  it('should not return error for missing format', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    delete basicPD.format;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for null format', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.format = null;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for empty format', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.format = {};

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for missing algo', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    delete basicPD.format.jwt.alg;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'formats values should not empty')]);
  });

  it('should return error for empty null algo', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.format.jwt.alg = null;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'formats values should not empty')]);
  });

  it('should return error for empty algo', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.format = {"jwt":{"alg": []}};

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'formats values should not empty')]);
  });

  it('should return error for empty algo value', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.format.jwt.alg = [''];

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{bundler: vb, target: basicPD}]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'formats should only have known identifiers for alg or proof_type')]);
  });

});
