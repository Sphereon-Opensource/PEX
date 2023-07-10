import fs from 'fs';

import {
  AdditionalClaims,
  ICredential,
  ICredentialSubject,
  IProof,
  IVerifiableCredential,
  IVerifiablePresentation,
  WrappedVerifiableCredential,
} from '@sphereon/ssi-types';

import { Status } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation';
import { InternalPresentationDefinitionV1, SSITypesBuilder } from '../../lib/types';
import PexMessages from '../../lib/types/Messages';
import { LimitDisclosureEvaluationResults } from '../test_data/limitDisclosureEvaluation/limitDisclosureEvaluationResults';
import { PdMultiCredentials } from '../test_data/limitDisclosureEvaluation/pdMultiCredentials';
import { VcMultiCredentials } from '../test_data/limitDisclosureEvaluation/vcMultiCredentials';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const HOLDER_DID = ['did:example:ebfeb1f712ebc6f1c276e12ec21'];

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = ['BbsBlsSignatureProof2020'];

describe('evaluate', () => {
  it("should return ok if verifiable Credential doesn't have the etc field", () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const wvcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]);
    evaluationClient.evaluate(pd, wvcs, { holderDIDs: HOLDER_DID, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES });
    expect((evaluationClient.wrappedVcs[0].credential.credentialSubject as ICredentialSubject & AdditionalClaims)['etc']).toBeUndefined();
  });

  it("should return ok if verifiable Credential doesn't have the birthPlace field", () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-schema-multiple-constraints.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    const wvcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]);
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pd, wvcs, { holderDIDs: HOLDER_DID, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES });
    expect((evaluationClient.wrappedVcs[0].credential.credentialSubject as ICredentialSubject & AdditionalClaims)['birthPlace']).toBeUndefined();
  });

  it('should report an error if limit disclosure is not supported', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-schema-multiple-constraints.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    if ('type' in (<IVerifiableCredential>vpSimple.verifiableCredential![0]).proof) {
      (<IProof>(vpSimple.verifiableCredential![0] as IVerifiableCredential).proof).type = 'limit disclosure unsupported';
    }
    const wvcs = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vpSimple.verifiableCredential![0]]);
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pd, wvcs, { holderDIDs: HOLDER_DID, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES });
    expect((evaluationClient.wrappedVcs[0].credential.credentialSubject as ICredentialSubject & AdditionalClaims)['birthPlace']).toEqual('Maarssen');
    expect(evaluationClient.results[9]).toEqual({
      evaluator: 'LimitDisclosureEvaluation',
      input_descriptor_path: '$.input_descriptors[0]',
      message: PexMessages.LIMIT_DISCLOSURE_NOT_SUPPORTED,
      status: 'error',
      verifiable_credential_path: '$[0]',
    });
  });

  it('should report an error if mandatory fields are absent', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-schema-multiple-constraints.json',
    ).presentation_definition;
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    const vc: IVerifiableCredential = (<IVerifiableCredential>vpSimple.verifiableCredential![0]) as IVerifiableCredential;
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    delete ((vc as ICredential).credentialSubject as ICredentialSubject & AdditionalClaims)['details'];
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([vc]);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pd, wvcs, { holderDIDs: HOLDER_DID, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES });
    expect((evaluationClient.wrappedVcs[0].credential.credentialSubject as ICredentialSubject & AdditionalClaims)['details']).toBeUndefined();
    expect(evaluationClient.results[8]).toEqual({
      evaluator: 'LimitDisclosureEvaluation',
      input_descriptor_path: '$.input_descriptors[0]',
      message: PexMessages.VERIFIABLE_CREDENTIAL_MANDATORY_FIELD_NOT_PRESENT,
      payload: ['$.credentialSubject.citizenship[*]', '$.credentialSubject.details.citizenship[*]'],
      status: 'error',
      verifiable_credential_path: '$[0]',
    });
  });

  it('should be 4 infos (limit disclosure supported by all)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = new PdMultiCredentials().getPresentationDefinition();
    const verifiableCredentials: IVerifiableCredential[] = new VcMultiCredentials().getVerifiableCredentials();
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentials);
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pd, wvcs, { holderDIDs: HOLDER_DID, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES });
    expect(evaluationClient.results.filter((ld) => ld.evaluator === 'LimitDisclosureEvaluation' && ld.status === Status.INFO)).toEqual(
      new LimitDisclosureEvaluationResults().getMultiCredentialResultsAllInfo(),
    );
  });

  //FIXME If atomic credential and not supports limit disclosure, but passes same subject the credential should not be valid for submission
  it('should be 3 infos and 1 error (limit disclosure unsupported by one)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = new PdMultiCredentials().getPresentationDefinition();
    const verifiableCredentials: IVerifiableCredential[] = new VcMultiCredentials().getVerifiableCredentials();
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentials);
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    verifiableCredentials[3].proof = {
      type: 'EcdsaSecp256k1VerificationKey2019',
      created: '2017-06-18T21:19:10Z',
      proofPurpose: 'assertionMethod',
      verificationMethod: 'https://example.edu/issuers/keys/1',
      jws: '...',
    };
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pd, wvcs, { holderDIDs: HOLDER_DID, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES });
    expect(evaluationClient.results.filter((ld) => ld.evaluator === 'LimitDisclosureEvaluation' && ld.status === Status.INFO)).toEqual(
      new LimitDisclosureEvaluationResults().getMultiCredentialResultsThreeInfos(),
    );
    expect(
      evaluationClient.results.filter(
        (ld) =>
          ld.evaluator === 'LimitDisclosureEvaluation' &&
          ld.input_descriptor_path === '$.input_descriptors[3]' &&
          ld.verifiable_credential_path === '$[3]' &&
          ld.status === Status.ERROR,
      ),
    ).toEqual(new LimitDisclosureEvaluationResults().getMultiCredentialResultsOneError());
  });
});
