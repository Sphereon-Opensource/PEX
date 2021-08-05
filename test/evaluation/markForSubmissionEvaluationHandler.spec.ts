import fs from 'fs';

import { PresentationDefinition } from "@sphereon/pe-models";

import { EvaluationClient } from "../../lib/evaluation/evaluationClient";
import { HandlerCheckResult } from "../../lib/evaluation/handlerCheckResult";
import { MarkForSubmissionEvaluationHandler } from "../../lib/evaluation/markForSubmissionEvaluationHandler";

const results: HandlerCheckResult[] = [
  {
    input_descriptor_path: '$.input_descriptors[0]',
    verifiable_credential_path: '$.verifiableCredential[0]',
    evaluator: 'UriEvaluation',
    status: 'info',
    message: 'presentation_definition URI for the schema of the candidate input is equal to one of the input_descriptors object uri values.'
  },
  {
    input_descriptor_path: '$.input_descriptors[0]',
    verifiable_credential_path: '$.verifiableCredential[0]',
    evaluator: 'FilterEvaluation',
    status: 'info',
    message: 'Input candidate valid for presentation submission',
    payload: { result: { value: 'eu', path: ["$", "details", "citizenship"]}, valid: true }
  },
  {
    input_descriptor_path: '$.input_descriptors[0]',
    verifiable_credential_path: '$.verifiableCredential[0]',
    evaluator: 'PredicateRelatedField',
    status: 'info',
    message: 'Input candidate valid for presentation submission',
    payload: { value: true, path: ["$", "age"] }
  }
]

function getFile(path: string): unknown {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('markForSubmissionEvaluationHandler tests', () => {

  it(`Mark input candidates for presentation submission`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]];
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.results.push(...results)
    const evaluationHandler = new MarkForSubmissionEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, inputCandidates);
    const length = evaluationHandler.getResults().length;
    expect(evaluationHandler.getResults()[length - 1]).toEqual({
      evaluator: "MarkForSubmissionEvaluation",
      input_descriptor_path: "$.input_descriptors[0]",
      message: "The input candidate is eligible for submission",
      payload: { group: ["A"] },
      status: "info",
      verifiable_credential_path: "$.verifiableCredential[0]"
    });
    expect(evaluationHandler.verifiablePresentation.presentationSubmission).toEqual(
      expect.objectContaining({
      definition_id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      descriptor_map: [{
        format: "ldp_vc",
        id: "banking_input_1",
        path: "$.verifiableCredential[0]",
      }]
    }));
  });

  it(`Mark input candidates with nested paths for presentation submission`, () => {
    const inputCandidates: unknown = getFile('./test/dif_pe_examples/vp/vp_nested_submission.json');
    const presentationDefinition: PresentationDefinition = getFile('./test/resources/pd_input_descriptor_filter.json')['presentation_definition'];
    presentationDefinition.input_descriptors = [presentationDefinition.input_descriptors[0]];
    const evaluationClient: EvaluationClient = new EvaluationClient();
    results[0].verifiable_credential_path = "$.outerClaim[0]"
    results[1].verifiable_credential_path = "$.innerClaim[1]"
    results[2].verifiable_credential_path = "$.mostInnerClaim[2]"
    evaluationClient.results.push(...results)
    const evaluationHandler = new MarkForSubmissionEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition, inputCandidates);
    const length = evaluationHandler.getResults().length;
    const actual = [evaluationHandler.getResults()[length - 3], evaluationHandler.getResults()[length - 2],evaluationHandler.getResults()[length - 1]]
    expect(actual).toEqual([{ 
      evaluator: "MarkForSubmissionEvaluation",
      input_descriptor_path: "$.input_descriptors[0]",
      message: "The input candidate is eligible for submission",
      payload: { group: ["A"] },
      status: "info",
      verifiable_credential_path: "$.outerClaim[0]"
    },
    { 
      evaluator: "MarkForSubmissionEvaluation",
      input_descriptor_path: "$.input_descriptors[0]",
      message: "The input candidate is eligible for submission",
      payload: { group: ["A"] },
      status: "info",
      verifiable_credential_path: "$.innerClaim[1]"
    },
    { 
      evaluator: "MarkForSubmissionEvaluation",
      input_descriptor_path: "$.input_descriptors[0]",
      message: "The input candidate is eligible for submission",
      payload: { group: ["A"] },
      status: "info",
      verifiable_credential_path: "$.mostInnerClaim[2]"
    }]);
    expect(evaluationHandler.verifiablePresentation.presentationSubmission).toEqual(
      expect.objectContaining({
      definition_id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      descriptor_map: [
        {"format": "ldp_vc",
         "id": "banking_input_1",
         "path": "$.outerClaim[0]", 
         "path_nested": {
           "format": "ldp_vc",
           "id": "banking_input_1", 
           "path": "$.innerClaim[1]",
           "path_nested": {
             "format": "ldp_vc",
             "id": "banking_input_1", 
             "path": "$.mostInnerClaim[2]"}
            }
          }
        ]
    }));
    expect(evaluationHandler.verifiablePresentation.outerClaim).toEqual([{
      comment: "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
      vc: {
        "@context": "https://www.w3.org/2018/credentials/v1",
        id: "https://eu.com/claims/DriversLicense",
        type: [
          "EUDriversLicense",
        ],
        issuer: "did:example:123",
        issuanceDate: "2010-01-01T19:73:24Z",
        credentialSubject: {
          id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
          accounts: [
            {
              id: "1234567890",
              route: "876543210",
            },
            {
              id: "2457913570",
              route: "DE-0753197542",
            },
          ],
        },
      },
    }]);
    expect(evaluationHandler.verifiablePresentation.innerClaim).toEqual([{
      comment: "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
      vc: {
        "@context": "https://www.w3.org/2018/credentials/v1",
        id: "https://eu.com/claims/DriversLicense",
        type: [
          "EUDriversLicense",
        ],
        issuer: "did:example:123",
        issuanceDate: "2010-01-01T19:73:24Z",
        credentialSubject: {
          id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
          accounts: [
            {
              id: "1234567890",
              route: "876543210",
            },
            {
              id: "2457913570",
              route: "DE-0753197542",
            },
          ],
        },
      },
    }]);
    expect(evaluationHandler.verifiablePresentation.mostInnerClaim).toEqual([{
      comment: "IN REALWORLD VPs, THIS WILL BE A BIG UGLY OBJECT INSTEAD OF THE DECODED JWT PAYLOAD THAT FOLLOWS",
      vc: {
        "@context": "https://www.w3.org/2018/credentials/v1",
        id: "https://eu.com/claims/DriversLicense",
        type: [
          "EUDriversLicense",
        ],
        issuer: "did:example:123",
        issuanceDate: "2010-01-01T19:73:24Z",
        credentialSubject: {
          id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
          accounts: [
            {
              id: "1234567890",
              route: "876543210",
            },
            {
              id: "2457913570",
              route: "DE-0753197542",
            },
          ],
        },
      },
    }]);
  });
});