import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../../../lib';
import { PresentationDefinitionVB, ValidationBundler, ValidationEngine } from '../../../lib/validation';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const base = './test/dif_pe_examples/pd/';
const files = fs.readdirSync(base);

describe('validate', () => {
  test.each(files)('.validateKnownExample(%s)', (file) => {
    const basicPD = getFile(base + file);

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD.presentation_definition }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for empty id', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.id = '';

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'id should not be empty')]);
  });

  it('should not return error for missing name', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    delete basicPD.name;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for empty name', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.name = '';

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'name should be a non-empty string')]);
  });

  it('should not return error for missing purpose', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    delete basicPD.purpose;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for empty purpose', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.purpose = '';

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'purpose should be a non-empty string')]);
  });

  it('should not return error for missing format', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    delete basicPD.format;

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for empty format', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD.format = {};

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for empty algo', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD!.format = { jwt: { alg: [] } };

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'formats values should not empty')]);
  });

  it('should return error for empty algo value', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    basicPD!.format!.jwt!.alg = [''];

    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([
      new Checked('root.presentation_definition', Status.ERROR, 'formats should only have known identifiers for alg or proof_type'),
    ]);
  });

  it('should report error for duplicate id', () => {
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_require_is_holder.json').presentation_definition;
    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');
    const ve = new ValidationEngine();
    basicPD.input_descriptors[0].constraints!.fields![0]!.id = 'uuid2021-05-04 00';
    basicPD.input_descriptors[0].constraints!.is_holder![0].field_id[0] = 'uuid2021-05-04 00';
    basicPD.input_descriptors[0].schema = [{ uri: 'https://www.w3.org/2018/credentials/v1' }];
    basicPD.input_descriptors[1].constraints!.fields![0]!.id = 'uuid2021-05-04 00';
    basicPD.input_descriptors[1].constraints!.is_holder![0].field_id[0] = 'uuid2021-05-04 00';
    basicPD.input_descriptors[1].schema = [{ uri: 'https://www.w3.org/2018/credentials/v1' }];
    delete basicPD.input_descriptors[2];
    delete basicPD.input_descriptors[3];
    const result = ve.validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('presentation_definition.input_descriptor', Status.ERROR, 'fields id must be unique')]);
  });
});
