import {InputDescriptors} from 'pe-models';

import {Checked, InputDescriptorVB, Status, ValidationEngine} from '../../../lib';

function getTestableInputDescriptors(): InputDescriptors[] {
  return [
    {
      "id": "banking_input_1",
      "name": "Bank Account Information",
      "purpose": "Bank Account required to remit payment.",
      "group": ["A"],
      "schema": [
        {
          "uri": "https://bank-standards.example.com#accounts",
          "required": true
        },
        {
          "uri": "https://bank-standards.example.com#investments",
          "required": false
        },
        {
          "uri": "https://bank-standards.example.com#investments",
        }
      ],
      "constraints": {
        "fields": [{
          "id": "uuid2021-05-04 00",
          "path": [
            "$.issuer",
            "$.vc.issuer",
            "$.iss"
          ]
        }]
      }
    },
    {
      "id": "banking_input_2",
      "schema": [
        {
          "uri": "https://bank-schemas.org/1.0.0/accounts.json"
        }
      ],
      "constraints": {
        "fields": [
          {
            "id": "uuid2021-05-04 01",
            "path": [
              "$.issuer",
              "$.vc.issuer",
              "$.iss"
            ]
          },
        ]
      }
    }
  ];
}

describe('input_descriptors tests', () => {

  it('There should be no error found', () => {
    const vb: InputDescriptorVB = new InputDescriptorVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([{bundler: vb, target: getTestableInputDescriptors()}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('test for an empty id', () => {
    const vb: InputDescriptorVB = new InputDescriptorVB('root');
    const ve = new ValidationEngine();
    const testableInputDescriptors = getTestableInputDescriptors();
    testableInputDescriptors[0].id = '';
    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual([new Checked('root.input_descriptor[0]', Status.ERROR, 'input descriptor id must be non-empty string')],);
  });

  it('test for an empty uri', () => {
    const vb: InputDescriptorVB = new InputDescriptorVB('root');
    const ve = new ValidationEngine();
    const testableInputDescriptors = getTestableInputDescriptors();
    testableInputDescriptors[0].schema = [{uri:''}];
    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual([new Checked('root.input_descriptor[0]', Status.ERROR, 'schema should have valid URI')],);
  });

  it('test for an empty name', () => {
    const vb: InputDescriptorVB = new InputDescriptorVB('root');
    const ve = new ValidationEngine();
    const testableInputDescriptors = getTestableInputDescriptors();
    testableInputDescriptors[0].name = '';
    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual([new Checked('root.input_descriptor[0]', Status.ERROR, 'input descriptor field should be non-empty string')],);
  });

  it('test for an empty purpose', () => {
    const vb: InputDescriptorVB = new InputDescriptorVB('root');
    const ve = new ValidationEngine();
    const testableInputDescriptors = getTestableInputDescriptors();
    testableInputDescriptors[0].purpose = '';
    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual([new Checked('root.input_descriptor[0]', Status.ERROR, 'input descriptor field should be non-empty string')],);
  });

  it('test for an empty purpose', () => {
    const vb: InputDescriptorVB = new InputDescriptorVB('root');
    const ve = new ValidationEngine();
    const testableInputDescriptors = getTestableInputDescriptors();
    testableInputDescriptors[1].constraints.fields[0].id = 'uuid2021-05-04 00';
    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual([new Checked('root.input_descriptor', Status.ERROR, 'fields id must be unique')],);
  });

});