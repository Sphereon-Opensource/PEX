import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClient, VerifiablePresentation } from '../../lib';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const HOLDER_DID = ['did:example:ebfeb1f712ebc6f1c276e12ec21'];

describe('evaluate', () => {

  it('should return ok if verifiable Credential doesn\'t have the etc field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pdSimpleSchemaAgePredicateExample.ts').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vpSimpleAgePredicateExample.ts');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple.verifiableCredential, HOLDER_DID);
    expect(evaluationClient.verifiableCredential[0].credentialSubject['etc']).toEqual(undefined);
  });

  it('should return ok if verifiable Credential doesn\'t have the birthPlace field', function() {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pdSchemaMultipleConstraintsExample.ts').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vpMultipleConstraintsExample.ts');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple.verifiableCredential, HOLDER_DID);
    expect(evaluationClient.verifiableCredential[0]['birthPlace']).toEqual(undefined);
  });
});
