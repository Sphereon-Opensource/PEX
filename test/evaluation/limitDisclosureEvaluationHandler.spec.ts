import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import { Status, VerifiableCredential, VerifiablePresentation } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation/evaluationClient';
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
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple.verifiableCredential, HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(evaluationClient.verifiableCredential[0].credentialSubject['etc']).toBeUndefined();
  });

  it("should return ok if verifiable Credential doesn't have the birthPlace field", () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple.verifiableCredential, HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(evaluationClient.verifiableCredential[0].credentialSubject['birthPlace']).toBeUndefined();
  });

  it('should report an error if limit disclosure is not supported', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    if ('type' in vpSimple.verifiableCredential[0].proof) {
      vpSimple.verifiableCredential[0].proof.type = 'limit disclosure unsupported';
    }
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple.verifiableCredential, HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(evaluationClient.verifiableCredential[0].credentialSubject['birthPlace']).toEqual('Maarssen');
    expect(evaluationClient.results[7]).toEqual({
      evaluator: 'LimitDisclosureEvaluation',
      input_descriptor_path: '$.input_descriptors[0]',
      message: 'Limit disclosure not supported',
      status: 'error',
      verifiable_credential_path: '$[0]',
    });
  });

  it('should report an error if mandatory fields are absent', () => {
    const pdSchema: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    const vpSimple: VerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-multiple-constraints.json');
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    delete vpSimple.verifiableCredential[0].credentialSubject['details'];
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, vpSimple.verifiableCredential, HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(evaluationClient.verifiableCredential[0].credentialSubject['details']).toBeUndefined();
    expect(evaluationClient.results[6]).toEqual({
      evaluator: 'LimitDisclosureEvaluation',
      input_descriptor_path: '$.input_descriptors[0]',
      message: 'mandatory field not present in the verifiableCredential',
      payload: ['$.credentialSubject.citizenship[*]', '$.credentialSubject.details.citizenship[*]'],
      status: 'error',
      verifiable_credential_path: '$[0]',
    });
  });

  it('should be 4 infos (limit disclosure supported by all)', () => {
    const pdSchema: PresentationDefinition = new PdMultiCredentials().getPresentationDefinition();
    const verifiableCredentials: VerifiableCredential[] = new VcMultiCredentials().getVerifiableCredentials();
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, verifiableCredentials, HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(evaluationClient.results.filter((ld) => ld.evaluator === 'LimitDisclosureEvaluation' && ld.status === Status.INFO)).toEqual(
      new LimitDisclosureEvaluationResults().getMultiCredentialResultsAllInfo()
    );
  });

  //FIXME If atomic credential and not supports limit disclosure, but passes same subject the credential should not be valid for submission
  it('should be 3 infos and 1 error (limit disclosure unsupported by one)', () => {
    const pdSchema: PresentationDefinition = new PdMultiCredentials().getPresentationDefinition();
    const verifiableCredentials: VerifiableCredential[] = new VcMultiCredentials().getVerifiableCredentials();
    pdSchema.input_descriptors[0].schema.push({ uri: 'https://www.w3.org/2018/credentials/v1' });
    verifiableCredentials[3].proof = {
      type: 'EcdsaSecp256k1VerificationKey2019',
      created: '2017-06-18T21:19:10Z',
      proofPurpose: 'assertionMethod',
      verificationMethod: 'https://example.edu/issuers/keys/1',
      jws: '...',
    };
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.evaluate(pdSchema, verifiableCredentials, HOLDER_DID, LIMIT_DISCLOSURE_SIGNATURE_SUITES);
    expect(evaluationClient.results.filter((ld) => ld.evaluator === 'LimitDisclosureEvaluation' && ld.status === Status.INFO)).toEqual(
      new LimitDisclosureEvaluationResults().getMultiCredentialResultsThreeInfos()
    );
    expect(
      evaluationClient.results.filter(
        (ld) =>
          ld.evaluator === 'LimitDisclosureEvaluation' &&
          ld.input_descriptor_path === '$.input_descriptors[3]' &&
          ld.verifiable_credential_path === '$[3]' &&
          ld.status === Status.ERROR
      )
    ).toEqual(new LimitDisclosureEvaluationResults().getMultiCredentialResultsOneError());
  });
});
