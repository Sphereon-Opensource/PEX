import { PresentationDefinitionV1 } from '@sphereon/pe-models';

import { PEX, PEXv1, ProofType } from '../../lib';
import { GatacaPresentationDefinition } from '../test_data/gataca/gatacaPresentationDefinition';
import { GatacaSelectedCredentials } from '../test_data/gataca/gatacaSelectedCredentials';

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = [ProofType.BbsBlsSignatureProof2020];

describe('evaluate gataca tests', () => {
  it('should return v1 in version discovery', function () {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV1 = new GatacaPresentationDefinition().getPresentationDefinition();
    const result = pex.definitionVersionDiscovery(pdSchema);
    expect(result.version).toEqual('v1');
  });

  it('Evaluate case with error result', () => {
    const pex: PEXv1 = new PEXv1();
    const pdSchema: PresentationDefinitionV1 = new GatacaPresentationDefinition().getPresentationDefinition();
    const vcs = new GatacaSelectedCredentials().getVerifiableCredentials();
    const result = pex.selectFrom(pdSchema, vcs, ['FAsYneKJhWBP2n5E21ZzdY'], LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    console.log(JSON.stringify(result, null, 2));
  });

  it('Gataca example just pick.all', function () {
    const pex: PEXv1 = new PEXv1();
    const pdSchema: PresentationDefinitionV1 = new GatacaPresentationDefinition().getPresentationDefinition();
    pdSchema.input_descriptors = [pdSchema.input_descriptors[0]];
    pdSchema.submission_requirements = [pdSchema.submission_requirements![0]];
    const vcs = new GatacaSelectedCredentials().getVerifiableCredentials();
    const result = pex.selectFrom(pdSchema, vcs, ['FAsYneKJhWBP2n5E21ZzdY'], LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    console.log(JSON.stringify(result, null, 2));
  });

  it('Gataca example just pick.pick', function () {
    const pex: PEXv1 = new PEXv1();
    const pdSchema: PresentationDefinitionV1 = new GatacaPresentationDefinition().getPresentationDefinition();
    pdSchema.input_descriptors = [pdSchema.input_descriptors[1], pdSchema.input_descriptors[2]];
    pdSchema.submission_requirements = [pdSchema.submission_requirements![1]];
    const vcs = new GatacaSelectedCredentials().getVerifiableCredentials();
    const result = pex.selectFrom(pdSchema, vcs, ['FAsYneKJhWBP2n5E21ZzdY'], LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    console.log(JSON.stringify(result, null, 2));
  });
});
