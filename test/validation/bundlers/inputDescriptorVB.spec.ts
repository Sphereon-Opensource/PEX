import {InputDescriptor} from '@sphereon/pe-models';

import { InputDescriptorsVB, ValidationEngine } from '../../../lib';
import { Checked, Status } from '../../../lib/ConstraintUtils';

function getTestableInputDescriptors(): InputDescriptor[] {
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
          ],
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
          {
            // id is undefined
            "path": ['a']
          }
        ],
      }
    },
  ];
}

function toChecked(message: string) {
  return [new Checked('root.input_descriptor[0]', Status.ERROR, message)];
}

describe('inputDescriptorsVB tests', () => {

  it('should be no error found in a completely valid input descriptor', () => {
    const vb: InputDescriptorsVB = new InputDescriptorsVB('root');
    const ve = new ValidationEngine();
    const result = ve.validate([{bundler: vb, target: getTestableInputDescriptors()}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')],);
  });

  it('should report error for undefined id', () => {
    const vb: InputDescriptorsVB = new InputDescriptorsVB('root');
    const ve = new ValidationEngine();

    const testableInputDescriptors = getTestableInputDescriptors();
    delete testableInputDescriptors[0].id;

    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual(toChecked('input descriptor id must be non-empty string'));
  });

  it('should report error for a null id', () => {
    const vb: InputDescriptorsVB = new InputDescriptorsVB('root');
    const ve = new ValidationEngine();

    const testableInputDescriptors = getTestableInputDescriptors();
    delete testableInputDescriptors[0].id;

    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual(toChecked('input descriptor id must be non-empty string'));
  });

  it('should report error for an empty id', () => {
    const vb: InputDescriptorsVB = new InputDescriptorsVB('root');
    const ve = new ValidationEngine();

    const testableInputDescriptors = getTestableInputDescriptors();
    testableInputDescriptors[0].id = '';

    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual(toChecked('input descriptor id must be non-empty string'));
  });

  it('should report error for an empty uri', () => {
    const vb: InputDescriptorsVB = new InputDescriptorsVB('root');
    const ve = new ValidationEngine();

    const testableInputDescriptors = getTestableInputDescriptors();
    testableInputDescriptors[0].schema = [{uri:''}];

    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual(toChecked('schema should have valid URI'));
  });

  it('should report error for an empty name', () => {
    const vb: InputDescriptorsVB = new InputDescriptorsVB('root');
    const ve = new ValidationEngine();

    const testableInputDescriptors = getTestableInputDescriptors();
    testableInputDescriptors[0].name = '';

    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual(toChecked('input descriptor name should be non-empty string'));
  });

  it('should report error for an empty purpose', () => {
    const vb: InputDescriptorsVB = new InputDescriptorsVB('root');
    const ve = new ValidationEngine();
    const testableInputDescriptors = getTestableInputDescriptors();
    testableInputDescriptors[0].purpose = '';
    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual(toChecked('input descriptor purpose should be non-empty string'));
  });

  it('should report error for duplicate id', () => {
    const vb: InputDescriptorsVB = new InputDescriptorsVB('root');
    const ve = new ValidationEngine();
    const testableInputDescriptors = getTestableInputDescriptors();
    testableInputDescriptors[1].constraints.fields[0].id = 'uuid2021-05-04 00';
    const result = ve.validate([{bundler: vb, target: testableInputDescriptors}]);
    expect(result).toEqual([new Checked('root.input_descriptor', Status.ERROR, 'fields id must be unique')]);
  });
});