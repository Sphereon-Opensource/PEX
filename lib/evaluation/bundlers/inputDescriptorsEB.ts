import { InputDescriptor } from '@sphereon/pe-models/model/inputDescriptor';
import Ajv from 'ajv';
import jp from 'jsonpath';

import { Evaluation } from '../core';

import { EvaluationBundler } from './evaluationBundler';

export class InputDescriptorsEB extends EvaluationBundler<unknown, InputDescriptor[]> {
  constructor(parentTag: string) {
    super(parentTag, 'input_descriptors');
  }

  public getEvaluations(d: any, p: InputDescriptor[]): Evaluation<any, any>[] {
    return [...this.inputCandidateEvaluations(d, p)];
  }

  private inputCandidateEvaluations(d: any, p: InputDescriptor[]): Evaluation<any, any>[] {
    return [
      {
        tag: this.getTag(),
        target: { d, p },
        predicate: () => d != null && p != null,
        message: 'input_definition should not be null',
      },
      {
        tag: this.getTag(),
        target: { d, p },
        predicate: InputDescriptorsEB.evaluateCandidates,
        message: 'input candidate is invalid',
      },
    ];
  }

  private static evaluateCandidates(inputCandidates: any, inputDescriptors: InputDescriptor[]): any {
    const matchingCandidates = [];
    for (let inputCandidate of jp.query(inputCandidates, '$.verifiableCredential[*]')) {
      for (let inputDescriptor of inputDescriptors) {
        let evaluation = InputDescriptorsEB.evaluateInput(inputCandidate, inputDescriptor);
        if (evaluation !== undefined) {
          matchingCandidates.push(evaluation);
        }
      }
    }
    return matchingCandidates;
  }

  private static evaluateInput(inputCandidate: any, inputDescriptor: InputDescriptor): any {
    if (inputDescriptor.constraints) {
      for (const field of inputDescriptor.constraints.fields) {
        for (const path of field.path) {
          const result = jp.query(inputCandidate, path);
          if (result.length) {
            if (field.filter) {
              const candidate = InputDescriptorsEB.searchProperty(inputCandidate, result[0]);
              const schema = {
                type: 'object',
                properties: {
                  [candidate.key]: {
                    ...field.filter,
                  },
                },
              };
              const ajv = new Ajv();
              const validate = ajv.compile(schema);
              const valid = validate(inputCandidate);
              if (field.predicate) {
                return valid;
              } else {
                if (!valid) {
                  return valid.toString();
                }
              }
            }
            return result[0];
          }
        }
      }
    }
  }

  private static searchProperty(obj: object, query:any) {
    for (const key in obj) {
      const value = obj[key];

      if (typeof value === 'object') {
        const result = this.searchProperty(value, query);
        if (result) {
          return result;
        }
      }

      if (value === query) {
        return { key: key, value: value };
      }
    }
  }
}
