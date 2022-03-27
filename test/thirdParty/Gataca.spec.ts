import { PresentationDefinitionV1 } from '@sphereon/pex-models';

import { PEX, PEXv1, ProofType, Status } from '../../lib';
import { IJsonLDPresentation, IJsonLdVerifiableCredential, IVerifiableCredential } from '../../lib/types/SSI.types';
import { GatacaPresentationDefinition } from '../test_data/gataca/gatacaPresentationDefinition';
import { GatacaSelectedCredentials } from '../test_data/gataca/gatacaSelectedCredentials';

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = [ProofType.BbsBlsSignatureProof2020];

describe('evaluate gataca tests', () => {
  it('should return v1 in version discovery', function () {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV1 = GatacaPresentationDefinition.getPresentationDefinition();
    const result = pex.definitionVersionDiscovery(pdSchema);
    expect(result.version).toEqual('v1');
  });

  it('Evaluate case with with both submission requirements', () => {
    const pex: PEXv1 = new PEXv1();
    const pdSchema: PresentationDefinitionV1 = GatacaPresentationDefinition.getPresentationDefinition();
    const vcs = GatacaSelectedCredentials.getVerifiableCredentials();
    const result = pex.selectFrom(pdSchema, vcs, ['FAsYneKJhWBP2n5E21ZzdY'], LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
    expect(result.matches).toEqual([
      {
        rule: 'all',
        from: ['mandatory'],
        vc_path: ['$.verifiableCredential[0]'],
        name: 'transcriptOfRecordsCredential',
      },
      {
        rule: 'pick',
        from: ['optional'],
        vc_path: ['$.verifiableCredential[1]'],
        name: 'transcriptOfRecordsCredential',
      },
    ]);
    expect(result.verifiableCredential?.length).toEqual(2);
  });

  it('Gataca example just pick.all', function () {
    const pex: PEXv1 = new PEXv1();
    const presentationDefinition: PresentationDefinitionV1 = GatacaPresentationDefinition.getPresentationDefinition();
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]];
    presentationDefinition.submission_requirements = [presentationDefinition.submission_requirements![0]];
    const vcs = GatacaSelectedCredentials.getVerifiableCredentials();
    const selectFromResult = pex.selectFrom(
      presentationDefinition,
      vcs,
      ['FAsYneKJhWBP2n5E21ZzdY'],
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    const presentationFromResult = pex.presentationFrom(
      presentationDefinition,
      selectFromResult.verifiableCredential as IVerifiableCredential[],
      undefined
    );
    expect((presentationFromResult as IJsonLDPresentation).presentation_submission?.descriptor_map).toEqual([
      {
        format: 'ldp_vc',
        id: 'emailCredential',
        path: '$.verifiableCredential[0]',
      },
    ]);
    expect((presentationFromResult as IJsonLDPresentation).verifiableCredential?.length).toEqual(1);
    expect(
      ((presentationFromResult as IJsonLDPresentation).verifiableCredential[0] as IJsonLdVerifiableCredential).id
    ).toEqual('cred:gatc:ZTQ3Y2EyZGFkZTdlMGM5ODRiZjFjOTcw');
  });

  it('Gataca example just pick.pick', function () {
    const pex: PEXv1 = new PEXv1();
    const pdSchema: PresentationDefinitionV1 = GatacaPresentationDefinition.getPresentationDefinition();
    pdSchema.input_descriptors = [pdSchema.input_descriptors[1], pdSchema.input_descriptors[2]];
    pdSchema.submission_requirements = [pdSchema.submission_requirements![1]];
    const vcs = GatacaSelectedCredentials.getVerifiableCredentials();
    const result = pex.selectFrom(pdSchema, vcs, ['FAsYneKJhWBP2n5E21ZzdY'], LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect((result.verifiableCredential![0] as IJsonLdVerifiableCredential).id).toEqual(
      'urn:credential:hEoISQtpfXua6VWzbGUKdON1rqxF3liv'
    );
  });

  it('should return v1 in version discovery second example', function () {
    const pex: PEX = new PEX();
    const pdSchema: PresentationDefinitionV1 = GatacaPresentationDefinition.getPresentationDefinition1();
    const result = pex.definitionVersionDiscovery(pdSchema);
    expect(result.version).toEqual('v1');
  });

  it('selectFrom should return two credentials', () => {
    const pex: PEXv1 = new PEXv1();
    const pdSchema: PresentationDefinitionV1 = GatacaPresentationDefinition.getPresentationDefinition1();
    const vcs = GatacaSelectedCredentials.getVerifiableCredentials1();
    const result = pex.selectFrom(pdSchema, vcs, ['FAsYneKJhWBP2n5E21ZzdY'], LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
    expect(result.matches).toEqual([
      {
        rule: 'all',
        from: ['mandatory'],
        vc_path: ['$.verifiableCredential[0]'],
        name: 'transcriptOfRecordsCredential',
      },
      {
        rule: 'pick',
        from: ['optional'],
        vc_path: ['$.verifiableCredential[1]'],
        name: 'transcriptOfRecordsCredential',
      },
    ]);
    expect(result.verifiableCredential?.length).toEqual(2);
  });

  it('should pick 1 from mandatory group and 1 from the optional group', function () {
    const pex: PEXv1 = new PEXv1();
    const presentationDefinition: PresentationDefinitionV1 = GatacaPresentationDefinition.getPresentationDefinition1();
    const vcs = GatacaSelectedCredentials.getVerifiableCredentials1();
    const selectFromResult = pex.selectFrom(
      presentationDefinition,
      vcs,
      ['FAsYneKJhWBP2n5E21ZzdY'],
      LIMIT_DISCLOSURE_SIGNATURE_SUITES
    );
    const presentationFromResult = pex.presentationFrom(
      presentationDefinition,
      selectFromResult.verifiableCredential as IVerifiableCredential[],
      undefined
    );
    expect((presentationFromResult as IJsonLDPresentation).presentation_submission?.descriptor_map).toEqual([
      {
        format: 'ldp_vc',
        id: 'emailCredential',
        path: '$.verifiableCredential[0]',
      },
      {
        format: 'ldp_vc',
        id: 'transcriptOfRecordsCredential',
        path: '$.verifiableCredential[1]',
      },
    ]);
    expect((presentationFromResult as IJsonLDPresentation).verifiableCredential?.length).toEqual(2);
    expect(
      ((presentationFromResult as IJsonLDPresentation).verifiableCredential[0] as IJsonLdVerifiableCredential).id
    ).toEqual('cred:gatc:NjMxNjc0NTA0ZjVmZmYwY2U0Y2M3NTRk');
  });
});
