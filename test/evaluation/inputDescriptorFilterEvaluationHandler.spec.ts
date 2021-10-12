import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import {
  EvaluationClient,
  EvaluationHandler,
  HandlerCheckResult,
  InputDescriptorFilterEvaluationHandler,
  Status, VerifiablePresentation
} from '../../lib';

const message: HandlerCheckResult = {
  input_descriptor_path: `$.input_descriptors[0]`,
  verifiable_credential_path: `$.verifiableCredential[0]`,
  evaluator: `FilterEvaluation`,
  status: Status.INFO,
  payload: { 'result': { 'path': ['$', 'vc', 'issuer'], 'value': 'did:example:123' }, 'valid': true },
  message: 'Input candidate valid for presentation submission'
};

function getFile(path: string): unknown {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('inputDescriptorFilterEvaluationHandler tests', () => {

  it(`input descriptor's constraint property missing`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentation: VerifiablePresentation = {
      '@context': inputCandidates['@context'],
      presentationSubmission: inputCandidates['presentation_submission'],
      type: inputCandidates['type'],
      verifiableCredential: inputCandidates['verifiableCredential'],
      holder: inputCandidates['holder'],
      proof: inputCandidates['proof']
    };
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]];
    const message0 = {...message};
    message0.payload = {"result": [], "valid": true};
    const message1 = {...message, ['verifiable_credential_path']: '$.verifiableCredential[1]'};
    message1.payload = {"result": [], "valid": true};
    const message2 = {...message, ['verifiable_credential_path']: '$.verifiableCredential[2]'};
    message2.payload = {"result": [], "valid": true};
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: EvaluationHandler = new InputDescriptorFilterEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, presentation);
    expect(evaluationClient.results).toEqual([message0, message1, message2]);
  });

  it(`input descriptor's constraints.fields property missing`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentation: VerifiablePresentation = {
      '@context': inputCandidates['@context'],
      presentationSubmission: inputCandidates['presentation_submission'],
      type: inputCandidates['type'],
      verifiableCredential: inputCandidates['verifiableCredential'],
      holder: inputCandidates['holder'],
      proof: inputCandidates['proof']
    };
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[1]];
    const message0 = {...message};
    message0.payload = {"result": [], "valid": true};
    const message1 = {...message, ['verifiable_credential_path']: '$.verifiableCredential[1]'};
    message1.payload = {"result": [], "valid": true};
    const message2 = {...message, ['verifiable_credential_path']: '$.verifiableCredential[2]'};
    message2.payload = {"result": [], "valid": true};
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: EvaluationHandler = new InputDescriptorFilterEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, presentation);
    expect(evaluationClient.results).toEqual([message0, message1, message2]);
  });

  it(`input descriptor's constraints.fields.length is equal to 0`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentation: VerifiablePresentation = {
      '@context': inputCandidates['@context'],
      presentationSubmission: inputCandidates['presentation_submission'],
      type: inputCandidates['type'],
      verifiableCredential: inputCandidates['verifiableCredential'],
      holder: inputCandidates['holder'],
      proof: inputCandidates['proof']
    };
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[2]];
    const message0 = {...message};
    message0.payload = {"result": [], "valid": true};
    const message1 = {...message, ['verifiable_credential_path']: '$.verifiableCredential[1]'};
    message1.payload = {"result": [], "valid": true};
    const message2 = {...message, ['verifiable_credential_path']: '$.verifiableCredential[2]'};
    message2.payload = {"result": [], "valid": true};
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: EvaluationHandler = new InputDescriptorFilterEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, presentation);
    expect(evaluationClient.results).toEqual([message0, message1, message2]);
  });

  it(`input descriptor's constraints.fields.path does not match`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentation: VerifiablePresentation = {
      '@context': inputCandidates['@context'],
      presentationSubmission: inputCandidates['presentation_submission'],
      type: inputCandidates['type'],
      verifiableCredential: inputCandidates['verifiableCredential'],
      holder: inputCandidates['holder'],
      proof: inputCandidates['proof']
    };
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[3]];
    const message0 = {
      ...message,
      ['status']: Status.ERROR,
      ['message']: 'Input candidate does not contain property'
    };
    message0.payload = {"result": [], "valid": false};
    const message1 = {...message0, ['verifiable_credential_path']: '$.verifiableCredential[1]'};
    message1.payload = {"result": [], "valid": false};
    const message2 = {...message0, ['verifiable_credential_path']: '$.verifiableCredential[2]'};
    message2.payload = {"result": [], "valid": false};
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: EvaluationHandler = new InputDescriptorFilterEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, presentation);
    expect(evaluationClient.results).toEqual([message0, message1, message2]);
  });

  it(`input descriptor's constraints.fields.filter does not match`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentation: VerifiablePresentation = {
      '@context': inputCandidates['@context'],
      presentationSubmission: inputCandidates['presentation_submission'],
      type: inputCandidates['type'],
      verifiableCredential: inputCandidates['verifiableCredential'],
      holder: inputCandidates['holder'],
      proof: inputCandidates['proof']
    };
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[4]];
    const message0 = {...message, ['status']: Status.ERROR, ['message']: 'Input candidate failed filter evaluation'};
    message0.payload = {"result": {"path": ["$", "vc", "issuer"], "value": "did:example:123"}, "valid": false};
    const message1 = {...message0, ['verifiable_credential_path']: '$.verifiableCredential[1]'};
    message1.payload = {"result": {"path": ["$", "issuer"], "value": "did:foo:123"}, "valid": false};
    const message2 = {...message0, ['verifiable_credential_path']: '$.verifiableCredential[2]'};
    message2.payload = {"result": {"path": ["$", "issuer"], "value": "did:foo:123"}, "valid": false};
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: EvaluationHandler = new InputDescriptorFilterEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, presentation);
    expect(evaluationClient.results).toEqual([message0, message1, message2]);
  });

  it(`input descriptor's constraint.fields.filter match`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentation: VerifiablePresentation = {
      '@context': inputCandidates['@context'],
      presentationSubmission: inputCandidates['presentation_submission'],
      type: inputCandidates['type'],
      verifiableCredential: inputCandidates['verifiableCredential'],
      holder: inputCandidates['holder'],
      proof: inputCandidates['proof']
    };
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[5]];
    const message1 = { ...message, ['verifiable_credential_path']: '$.verifiableCredential[1]' };
    message1.payload = { 'result': { 'path': ['$', 'issuer'], 'value': 'did:foo:123' }, 'valid': true };
    const message2 = { ...message, ['verifiable_credential_path']: '$.verifiableCredential[2]' };
    message2.payload = { 'result': { 'path': ['$', 'issuer'], 'value': 'did:foo:123' }, 'valid': true };
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: EvaluationHandler = new InputDescriptorFilterEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, presentation);
    expect(evaluationClient.results).toEqual([message, message1, message2]);
  });

  it(`input descriptor's constraint.fields.filter match and nested_path`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_nested_submission.json');
    const presentation: VerifiablePresentation = {
      '@context': inputCandidates['@context'],
      presentationSubmission: inputCandidates['presentation_submission'],
      type: inputCandidates['type'],
      verifiableCredential: inputCandidates['verifiableCredential'],
      holder: inputCandidates['holder'],
      proof: inputCandidates['proof']
    };
    presentation['outerClaim'] = inputCandidates['outerClaim'];
    presentation['innerClaim'] = inputCandidates['innerClaim'];
    presentation['mostInnerClaim'] = inputCandidates['mostInnerClaim'];
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[6]];
    const message0 = {...message, ['verifiable_credential_path']: '$.outerClaim[0]' };
    const message1 = {...message0, ['payload']: { "result": { "path": ["$", "vc", "credentialSubject", "accounts", 0, "id"], "value": "1234567890" }, "valid": true } }
    const message2 = {...message1, ['payload']: { "result": { "path": ["$", "vc", "credentialSubject", "accounts", 0, "route"], "value": "876543210" }, "valid": true } }
    const message3 = {...message0, ['verifiable_credential_path']: '$.innerClaim[1]' };
    const message4 = {...message1, ['verifiable_credential_path']: '$.innerClaim[1]' };
    const message5 = {...message2, ['verifiable_credential_path']: '$.innerClaim[1]' };
    const message6 = {...message0, ['verifiable_credential_path']: '$.mostInnerClaim[2]' };
    const message7 = {...message1, ['verifiable_credential_path']: '$.mostInnerClaim[2]' };
    const message8 = {...message2, ['verifiable_credential_path']: '$.mostInnerClaim[2]' };
    const evaluationClient: EvaluationClient = new EvaluationClient();
    const evaluationHandler: EvaluationHandler = new InputDescriptorFilterEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, presentation);
    expect(evaluationClient.results.filter(result => result.status === Status.INFO))
      .toEqual([message0, message1, message2, message3, message4, message5, message6, message7, message8]);
  });
});