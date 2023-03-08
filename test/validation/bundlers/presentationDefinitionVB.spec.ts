import fs from 'fs';

import { InputDescriptorV2, PresentationDefinitionV1, PresentationDefinitionV2 } from '@sphereon/pex-models';

import { Checked, Status } from '../../../lib';
import { PresentationDefinitionV1VB, PresentationDefinitionV2VB, ValidationBundler, ValidationEngine } from '../../../lib/validation';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const baseV1 = './test/dif_pe_examples/pdV1/';
const baseV2 = './test/dif_pe_examples/pdV2/';
const filesV1 = fs.readdirSync(baseV1);
const filesV2 = fs.readdirSync(baseV2);

function getPresentationDefinitionV2(): PresentationDefinitionV2 {
  return {
    id: '32f54163-7166-48f1-93d8-ff217bdb0653',
    name: 'Conference Entry Requirements',
    purpose: 'We can only allow people associated with Washington State business representatives into conference areas',
    format: {
      jwt: {
        alg: ['ES384'],
      },
      jwt_vc: {
        alg: ['ES384'],
      },
      jwt_vp: {
        alg: ['ES384'],
      },
      ldp_vc: {
        proof_type: ['JsonWebSignature2020', 'Ed25519Signature2018', 'EcdsaSecp256k1Signature2019', 'RsaSignature2018'],
      },
      ldp_vp: {
        proof_type: ['Ed25519Signature2018'],
      },
      ldp: {
        proof_type: ['RsaSignature2018'],
      },
    },
    input_descriptors: [
      {
        id: 'wa_driver_license',
        name: 'Washington State Business License',
        purpose: 'We can only allow licensed Washington State business representatives into the WA Business Conference',
      },
    ],
    frame: {
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
    },
  };
}
describe('validate', () => {
  test.each(filesV1)('V1.validateKnownExample(%s)', (file) => {
    const basicPD = getFile(baseV1 + file);

    const vb: ValidationBundler<PresentationDefinitionV1> = new PresentationDefinitionV1VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD.presentation_definition }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  test.each(filesV2)('V2.validateKnownExample(%s)', (file) => {
    const basicPD = getFile(baseV2 + file);

    const vb: ValidationBundler<PresentationDefinitionV2> = new PresentationDefinitionV2VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD.presentation_definition }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for empty id v1', () => {
    const basicPD: PresentationDefinitionV1 = getFile('./test/resources/pd_basic.json');
    basicPD.id = '';

    const vb: ValidationBundler<PresentationDefinitionV1> = new PresentationDefinitionV1VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'id should not be empty')]);
  });

  it('should return error for empty id v2', () => {
    const basicPD: PresentationDefinitionV2 = getPresentationDefinitionV2();
    basicPD.id = '';
    const vb: ValidationBundler<PresentationDefinitionV2> = new PresentationDefinitionV2VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'id should not be empty')]);
  });

  it('should not return error for missing name v1', () => {
    const basicPD: PresentationDefinitionV1 = getFile('./test/resources/pd_basic.json');
    delete basicPD.name;

    const vb: ValidationBundler<PresentationDefinitionV1> = new PresentationDefinitionV1VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for missing name v2', () => {
    const basicPD: PresentationDefinitionV2 = getPresentationDefinitionV2();
    delete basicPD.name;

    const vb: ValidationBundler<PresentationDefinitionV2> = new PresentationDefinitionV2VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for empty name v1', () => {
    const basicPD: PresentationDefinitionV1 = getFile('./test/resources/pd_basic.json');
    basicPD.name = '';

    const vb: ValidationBundler<PresentationDefinitionV1> = new PresentationDefinitionV1VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'name should be a non-empty string')]);
  });

  it('should return error for empty name v2', () => {
    const basicPD: PresentationDefinitionV2 = getPresentationDefinitionV2();
    basicPD.name = '';

    const vb: ValidationBundler<PresentationDefinitionV2> = new PresentationDefinitionV2VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'name should be a non-empty string')]);
  });

  it('should not return error for missing purpose v1', () => {
    const basicPD: PresentationDefinitionV1 = getFile('./test/resources/pd_basic.json');
    delete basicPD.purpose;

    const vb: ValidationBundler<PresentationDefinitionV1> = new PresentationDefinitionV1VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for missing purpose v2', () => {
    const basicPD: PresentationDefinitionV2 = getPresentationDefinitionV2();
    delete basicPD.purpose;

    const vb: ValidationBundler<PresentationDefinitionV2> = new PresentationDefinitionV2VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for empty purpose v1', () => {
    const basicPD: PresentationDefinitionV1 = getFile('./test/resources/pd_basic.json');
    basicPD.purpose = '';

    const vb: ValidationBundler<PresentationDefinitionV1> = new PresentationDefinitionV1VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'purpose should be a non-empty string')]);
  });

  it('should return error for empty purpose v2', () => {
    const basicPD: PresentationDefinitionV2 = getFile('./test/resources/pd_basic.json');
    delete basicPD.input_descriptors[0]['schema' as keyof InputDescriptorV2];
    basicPD.purpose = '';

    const vb: ValidationBundler<PresentationDefinitionV2> = new PresentationDefinitionV2VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'purpose should be a non-empty string')]);
  });

  it('should not return error for missing format v1', () => {
    const basicPD: PresentationDefinitionV1 = getFile('./test/resources/pd_basic.json');
    delete basicPD.format;

    const vb: ValidationBundler<PresentationDefinitionV1> = new PresentationDefinitionV1VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for missing format v2', () => {
    const basicPD: PresentationDefinitionV2 = getPresentationDefinitionV2();
    delete basicPD.format;

    const vb: ValidationBundler<PresentationDefinitionV2> = new PresentationDefinitionV2VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for empty format v1', () => {
    const basicPD: PresentationDefinitionV1 = getFile('./test/resources/pd_basic.json');
    basicPD.format = {};

    const vb: ValidationBundler<PresentationDefinitionV1> = new PresentationDefinitionV1VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should not return error for empty format v2', () => {
    const basicPD: PresentationDefinitionV2 = getPresentationDefinitionV2();
    basicPD.format = {};

    const vb: ValidationBundler<PresentationDefinitionV2> = new PresentationDefinitionV2VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });

  it('should return error for empty algo v1', () => {
    const basicPD: PresentationDefinitionV1 = getFile('./test/resources/pd_basic.json');
    basicPD!.format = { jwt: { alg: [] } };

    const vb: ValidationBundler<PresentationDefinitionV1> = new PresentationDefinitionV1VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([
      new Checked('root.presentation_definition', Status.ERROR, 'presentation_definition should be as per json schema.'),
      new Checked('root.presentation_definition', Status.ERROR, 'formats values should not empty'),
    ]);
  });

  it('should return error for empty algo v2', () => {
    const basicPD: PresentationDefinitionV2 = getPresentationDefinitionV2();
    basicPD!.format = { jwt: { alg: [] } };

    const vb: ValidationBundler<PresentationDefinitionV2> = new PresentationDefinitionV2VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([
      new Checked('root.presentation_definition', Status.ERROR, 'presentation_definition should be as per json schema.'),
      new Checked('root.presentation_definition', Status.ERROR, 'formats values should not empty'),
    ]);
  });

  it('should return error for empty algo value v1', () => {
    const basicPD: PresentationDefinitionV1 = getFile('./test/resources/pd_basic.json');
    basicPD!.format!.jwt!.alg = [''];

    const vb: ValidationBundler<PresentationDefinitionV1> = new PresentationDefinitionV1VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([
      new Checked('root.presentation_definition', Status.ERROR, 'formats should only have known identifiers for alg or proof_type'),
    ]);
  });

  it('should return error for empty algo value v2', () => {
    const basicPD: PresentationDefinitionV2 = getPresentationDefinitionV2();
    basicPD!.format!.jwt!.alg = [''];

    const vb: ValidationBundler<PresentationDefinitionV2> = new PresentationDefinitionV2VB('root');

    const result = new ValidationEngine().validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([
      new Checked('root.presentation_definition', Status.ERROR, 'formats should only have known identifiers for alg or proof_type'),
    ]);
  });

  it('should report error for duplicate id', () => {
    const basicPD: PresentationDefinitionV1 = getFile('./test/resources/pd_require_is_holder.json').presentation_definition;
    const vb: ValidationBundler<PresentationDefinitionV1> = new PresentationDefinitionV1VB('root');
    const ve = new ValidationEngine();
    basicPD.input_descriptors[0].constraints!.fields![0]!.id = 'uuid2021-05-04 00';
    basicPD.input_descriptors[0].constraints!.is_holder![0].field_id[0] = 'uuid2021-05-04 00';
    basicPD.input_descriptors[0].schema = [{ uri: 'https://www.w3.org/2018/credentials/v1' }];
    basicPD.input_descriptors[1].constraints!.fields![0]!.id = 'uuid2021-05-04 00';
    basicPD.input_descriptors[1].constraints!.is_holder![0].field_id[0] = 'uuid2021-05-04 00';
    basicPD.input_descriptors[1].schema = [{ uri: 'https://www.w3.org/2018/credentials/v1' }];
    basicPD.input_descriptors = [basicPD.input_descriptors[0], basicPD.input_descriptors[1]];
    const result = ve.validate([{ bundler: vb, target: basicPD }]);
    expect(result).toEqual([new Checked('presentation_definition.input_descriptor', Status.ERROR, 'fields id must be unique')]);
  });
});
