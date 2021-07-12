import fs from 'fs';

import {InputDescriptor} from '@sphereon/pe-models';
import jp from 'jsonpath';


import {Checked, InputDescriptorsVB, Status, ValidationEngine} from '../../../lib';

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
          "filter": {
            "type": "string",
            "pattern": "did:example:123|did:example:456"
          }
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
    {
      "id": "banking_input_3",
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
          "id": "uuid2021-07-12 00",
          "path": [
            "$.issuer",
            "$.vc.issuer",
            "$.iss"
          ],
          "filter": {
            "type": "string",
            "pattern": "did:example:123|did:example:456"
          },
          "predicate": "required"
        }]
      }
    }
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

  it('Evaluate input candidate with path', () => {
    const testableInputDescriptors = getTestableInputDescriptors();
    const inputCandidate = fs.readFileSync('./test/dif_pe_examples/vp/vp_general.json', 'utf-8');
    const result = new InputDescriptorsVB('root').evaluateInput(testableInputDescriptors[1], jp.query(JSON.parse(inputCandidate), '$.verifiableCredential[*]')[1]);
    expect(result).toEqual(["did:foo:123"]);
  });

  it('Evaluate input candidate with path and filter', () => {
    const testableInputDescriptors = getTestableInputDescriptors();
    const inputCandidate = fs.readFileSync('./test/dif_pe_examples/vp/vp_general.json', 'utf-8');
    const result = new InputDescriptorsVB('root').evaluateInput(testableInputDescriptors[0], jp.query(JSON.parse(inputCandidate), '$.verifiableCredential[*]')[0]);
    expect(result).toEqual(["did:example:123"]);
  });
  
  it('Evaluate input candidate with path and filter and predicate', () => {
    const testableInputDescriptors = getTestableInputDescriptors();
    const inputCandidate = fs.readFileSync('./test/dif_pe_examples/vp/vp_general.json', 'utf-8');
    const result = new InputDescriptorsVB('root').evaluateInput(testableInputDescriptors[2], jp.query(JSON.parse(inputCandidate), '$.verifiableCredential[*]')[2]);
    expect(result).toBe(true);
  });
});