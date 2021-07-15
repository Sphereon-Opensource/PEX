import fs from 'fs';

import {PresentationDefinition, PresentationSubmission} from '@sphereon/pe-models';

import {CandidateInputFitsInputDescriptorEB, Checked, EvaluationBundler, EvaluationEngine, Status} from "../../../lib";


function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('validate', () => {

  it('should return error for not matching (exactly) any URI for the schema of the candidate input with one of the Input Descriptor schema object uri values.', () => {
    const vpGeneral: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');

    const eb: EvaluationBundler<unknown, PresentationDefinition> = new CandidateInputFitsInputDescriptorEB('root');

    const result = new EvaluationEngine().evaluate([{bundler: eb, target: {d: vpGeneral, p: basicPD}}]);
    expect(result).toEqual([new Checked('root.presentation_definition', Status.ERROR, 'presentation_definition URI for the schema of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.')]);
  });

  it('should return ok for matching (exactly) one URI for the schema of the candidate input with one of the Input Descriptor schema object uri values.', () => {
    const vpGeneral: PresentationSubmission = getFile('./test/dif_pe_examples/vp/vp_business.json');
    const basicPD: PresentationDefinition = getFile('./test/resources/pd_basic.json');
    const eb: EvaluationBundler<unknown, PresentationDefinition> = new CandidateInputFitsInputDescriptorEB('root');
    const result = new EvaluationEngine().evaluate([{bundler: eb, target: {d: basicPD, p: vpGeneral}}]);
    expect(result).toEqual([new Checked('root', Status.INFO, 'ok')]);
  });
});
