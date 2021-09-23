import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { VP } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation/evaluationClient';
import { Presentation } from '../../lib/verifiablePresentation/models';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const HOLDER_DID = 'did:example:ebfeb1f712ebc6f1c276e12ec21';

describe('evaluate', () => {

  it('should return ok if verifiablePresentation doesn\'t have the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: Presentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(pdSchema, new VP(vpSimple));
    expect(evaluationClient.verifiablePresentation.getVerifiableCredentials()[0]['etc']).toEqual(undefined);
  });

  it('should return ok if verifiablePresentation doesn\'t have the birthPlace field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const evaluationClient: EvaluationClient = new EvaluationClient();
    vpSimple.holder = HOLDER_DID;
    evaluationClient.evaluate(pdSchema, new VP(vpSimple));
    expect(evaluationClient.verifiablePresentation.getVerifiableCredentials()[0]['birthPlace']).toEqual(undefined);
  });
});