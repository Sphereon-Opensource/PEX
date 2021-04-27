import {PresentationDefinition} from "pe-models";

import {PresentationDefinitionVB} from "../../../lib";
import {ValidationBundler} from '../../../lib';
import {Checked, Status} from '../../../lib'
import {ValidationEngine} from "../../../lib";

describe('ValidationEngine tests', () => {
  it('there should be no errors', () => {
    const pd: PresentationDefinition = {id: 'john', input_descriptors: [{id: 'in_desc1', schema: [{uri: ''}]}]};
    const vb: ValidationBundler<PresentationDefinition> = new PresentationDefinitionVB('root');
    const result = new ValidationEngine().validate([[vb, pd]]);
    expect(result).toEqual([new Checked('pd.in_desc', Status.ERROR, 'must contain non-null name')]);

  });
});
