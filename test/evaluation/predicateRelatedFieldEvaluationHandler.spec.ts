import fs from 'fs';

import { Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { PredicateRelatedFieldEvaluationHandler, Status } from '../../lib';
import { EvaluationClient } from "../../lib/evaluation/evaluationClient";
import { HandlerCheckResult } from "../../lib/evaluation/handlerCheckResult";

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {

  it('should return ok if payload value of PredicateRelatedField is integer', function () {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.results.push(
      {
        "input_descriptor_path": "$.input_descriptors[0]",
        "verifiable_credential_path": "$.verifiableCredential[0]",
        "evaluator": "UriEvaluation",
        "status": "info",
        "message": "presentation_definition URI for the schema of the candidate input is equal to one of the input_descriptors object uri values.",
        "payload": {
          "presentationDefinitionUris": [
            "https://www.w3.org/TR/vc-data-model/#types"
          ],
          "inputDescriptorsUris": [
            "https://www.w3.org/TR/vc-data-model/#types"
          ]
        }
      });
    evaluationClient.results.push({
        "input_descriptor_path": "$.input_descriptors[0]",
        "verifiable_credential_path": "$.verifiableCredential[0]",
        "evaluator": "FilterEvaluation",
        "status": "info",
        "message": "Input candidate valid for presentation submission",
        "payload": {
          "result": {
            "value": 19,
            "path": [
              "$",
              "age"
            ]
          },
          "valid": true
        }
      });
    const evaluationHandler = new PredicateRelatedFieldEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition);
    expect(evaluationClient.results[2]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'PredicateRelatedFieldEvaluation', Status.INFO, "Input candidate valid for presentation submission", {
      "path": ["$", "age"],
      "value": 19
    }));
  });

  it('should return ok if payload value of PredicateRelatedField is boolean', function () {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    presentationDefinition.input_descriptors[0].constraints.fields[0].predicate = Optionality.Preferred;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.results.push({
        "input_descriptor_path": "$.input_descriptors[0]",
        "verifiable_credential_path": "$.verifiableCredential[0]",
        "evaluator": "UriEvaluation",
        "status": "info",
        "message": "presentation_definition URI for the schema of the candidate input is equal to one of the input_descriptors object uri values.",
        "payload": {
          "presentationDefinitionUris": [
            "https://www.w3.org/TR/vc-data-model/#types"
          ],
          "inputDescriptorsUris": [
            "https://www.w3.org/TR/vc-data-model/#types"
          ]
        }
      });
    evaluationClient.results.push({
      "input_descriptor_path": "$.input_descriptors[0]",
      "verifiable_credential_path": "$.verifiableCredential[0]",
      "evaluator": "FilterEvaluation",
      "status": "info",
      "message": "Input candidate valid for presentation submission",
      "payload": {
        "result": {
          "value": 19,
          "path": [
            "$",
            "age"
          ]
        },
        "valid": true
      }
    });
    const evaluationHandler = new PredicateRelatedFieldEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition);
    expect(evaluationClient.results[2]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'PredicateRelatedFieldEvaluation', Status.INFO, "Input candidate valid for presentation submission", {
      "path": ["$", "age"],
      "value": true
    }));
  });

  it('should return error if we process the predicate filter for this PD', function () {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-simple-schema-age-predicate.json').presentation_definition;
    presentationDefinition.input_descriptors[0].constraints.fields[0].predicate = Optionality.Preferred;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.results.push({
      "input_descriptor_path": "$.input_descriptors[0]",
      "verifiable_credential_path": "$.verifiableCredential[0]",
      "evaluator": "UriEvaluation",
      "status": "info",
      "message": "presentation_definition URI for the schema of the candidate input is equal to one of the input_descriptors object uri values.",
      "payload": {
        "presentationDefinitionUris": [
          "https://www.w3.org/TR/vc-data-model/#types"
        ],
        "inputDescriptorsUris": [
          "https://www.w3.org/TR/vc-data-model/#types"
        ]
      }
    });
    evaluationClient.results.push({
      "input_descriptor_path": "$.input_descriptors[0]",
      "verifiable_credential_path": "$.verifiableCredential[0]",
      "evaluator": "FilterEvaluation",
      "status": "error",
      "message": "Input candidate does not contain property",
      "payload": {
        "result": [],
        "valid": false
      }
    });
    const evaluationHandler = new PredicateRelatedFieldEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition);
    expect(evaluationClient.results.length).toEqual(2);
  });

  it('should return ok if verifiableCredential\'s age value is matching the specification in the input descriptor', function () {
    const presentationDefinition: PresentationDefinition = getFile('./test/dif_pe_examples/pd/pd-schema-multiple-constraints.json').presentation_definition;
    presentationDefinition.input_descriptors[0].constraints.fields[0].predicate = Optionality.Preferred;
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.results.push({
      "input_descriptor_path": "$.input_descriptors[0]",
      "verifiable_credential_path": "$.verifiableCredential[0]",
      "evaluator": "UriEvaluation",
      "status": "info",
      "message": "presentation_definition URI for the schema of the candidate input is equal to one of the input_descriptors object uri values.",
      "payload": {
        "presentationDefinitionUris": [
          "https://www.w3.org/TR/vc-data-model/#types"
        ],
        "inputDescriptorsUris": [
          "https://www.w3.org/TR/vc-data-model/#types"
        ]
      }
    });
    evaluationClient.results.push({
      "input_descriptor_path": "$.input_descriptors[0]",
      "verifiable_credential_path": "$.verifiableCredential[0]",
      "evaluator": "FilterEvaluation",
      "status": "info",
      "message": "Input candidate valid for presentation submission",
      "payload": {
        "result": {
          "value": 19,
          "path": [
            "$",
            "age"
          ]
        },
        "valid": true
      }
    });
    evaluationClient.results.push({
      "input_descriptor_path": "$.input_descriptors[0]",
      "verifiable_credential_path": "$.verifiableCredential[0]",
      "evaluator": "FilterEvaluation",
      "status": "info",
      "message": "Input candidate valid for presentation submission",
      "payload": {
        "result": {
          "path": [
            "$",
            "details",
            "citizenship",
            0
          ],
          "value": "eu"
        },
        "valid": true
      }
    });
    evaluationClient.results.push({
      "input_descriptor_path": "$.input_descriptors[0]",
      "verifiable_credential_path": "$.verifiableCredential[0]",
      "evaluator": "FilterEvaluation",
      "status": "info",
      "message": "Input candidate valid for presentation submission",
      "payload": {
        "result": {
          "value": "NLD",
          "path": [
            "$",
            "country",
            0,
            "abbr"
          ]
        },
        "valid": true
      }
    });
    const evaluationHandler = new PredicateRelatedFieldEvaluationHandler(evaluationClient);
    evaluationHandler.handle(presentationDefinition);
    expect(evaluationClient.results[4]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'PredicateRelatedFieldEvaluation', Status.INFO, "Input candidate valid for presentation submission", {"value":true, "path":["$","age"]}));
    expect(evaluationClient.results[5]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'PredicateRelatedFieldEvaluation', Status.INFO, "Input candidate valid for presentation submission", {"value":"eu", "path":["$","details","citizenship",0]}));
    expect(evaluationClient.results[6]).toEqual(new HandlerCheckResult('$.input_descriptors[0]', '$.verifiableCredential[0]', 'PredicateRelatedFieldEvaluation', Status.INFO, "Input candidate valid for presentation submission", {
      "value": "NLD",
      "path": [
        "$",
        "country",
        0,
        "abbr"
      ]
    }));
  });
});