import fs from 'fs';

import {PresentationDefinition} from '@sphereon/pe-models';

import {PresentationDefinitionVB} from "../../../lib";
import {ValidationBundler} from "../../../lib";
import {Checked, Status} from '../../../lib';
import {ValidationEngine} from "../../../lib";


function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const base = './test/dif_pe_examples/pd/';

describe('validate', () => {

  it('There should be no error in the DIF PE Spec Examples', () => {

    fs.readdirSync(base).forEach(file => {
      const examplePresentationDefinition = getFile(base + file);

      const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');

      const result = new ValidationEngine().validate([{bundler: vb, target: examplePresentationDefinition.presentation_definition}]);
      expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
    });

  });

});
