import { Field, InputDescriptor } from '@sphereon/pe-models';

import { Evaluation } from '../core';

import { EvaluationBundler } from './evaluationBundler';

export class PredicateEB extends EvaluationBundler<InputDescriptor[], unknown> {
  constructor(parentTag: string) {
    super(parentTag, 'input_descriptor');
  }

  public getEvaluations(d: InputDescriptor[], p: unknown): Evaluation<InputDescriptor[], unknown>[] {
    return [
      {
        tag: this.getTag(),
        target: { d, p },
        predicate: (d) => d != null,
        message: 'fields should be non null.',
      },
      {
        tag: this.getTag(),
        target: { d, p },
        predicate: PredicateEB.ifPredicateIsPresentFilterShouldBePresent,
        message: 'if in the field we have predicate value, the filter value should be present as well.',
      },
      {
        tag: this.getTag(),
        target: { d, p },
        predicate: PredicateEB.predicateValueShouldBeOfTypeOptionality,
        message: "predicate value should be of type 'optionality'.",
      },
      {
        tag: this.getTag(),
        target: { d, p },
        predicate: PredicateEB.predicateRelatedFieldShouldBeBoolean,
        message: "verifiableCredential's matching predicate property should be boolean",
      },
    ];
  }

  private static ifPredicateIsPresentFilterShouldBePresent(inputDescriptors: InputDescriptor[]): boolean {
    for (let i = 0; i < inputDescriptors.length; i++) {
      const inputDescriptor: InputDescriptor = inputDescriptors[i];
      for (let j = 0; j < inputDescriptor.constraints.fields.length; j++) {
        const field: Field = inputDescriptor.constraints.fields[j];
        if (field.predicate) {
          return field.filter != null;
        }
      }
    }

    return true;
  }

  private static predicateValueShouldBeOfTypeOptionality(inputDescriptors: InputDescriptor[]): boolean {
    for (let i = 0; i < inputDescriptors.length; i++) {
      const inputDescriptor: InputDescriptor = inputDescriptors[i];
      for (let j = 0; j < inputDescriptor.constraints.fields.length; j++) {
        const field: Field = inputDescriptor.constraints.fields[j];
        if (field.predicate) {
          return field.predicate === ('required' || 'preferred');
        }
      }
    }
    return true;
  }

  private static predicateRelatedFieldShouldBeBoolean(
    inputDescriptors: InputDescriptor[],
    verifiablePresentation: any
  ): boolean {
    for (let i = 0; i < inputDescriptors.length; i++) {
      const inputDescriptor: InputDescriptor = inputDescriptors[i];
      const predicateFields = [];
      inputDescriptor.constraints.fields.forEach((f) => {
        if (f.predicate) {
          predicateFields.push(...f.path);
        }
      });
      const predicateValueCandidate = [];

      predicateFields.forEach((pf) => {
        predicateValueCandidate.push({ pf: pf, values: [] });
      });

      verifiablePresentation.verifiableCredential.forEach((vc) => {
        predicateValueCandidate.forEach((pvc) => {
          //It's possible that for some VCs we have the boolean value for some othe VCs we have the actual value?
          // Then we will need to check all the related paths to see if we have any boolean response for that specific field. if yes, then we're safe.
          if (vc[pvc.pf]) {
            pvc.values.push(vc[pvc.pf].substring(2));
          }
        });
      });
      for (let i = 0; i < predicateValueCandidate.length; i++) {
        const pvc = predicateValueCandidate[i];
        // Here we check for each entry to have at least one boolean field
        let foundBooleanVal = false;
        for (let i = 0; i < pvc.values.length; i++) {
          if (pvc.values[i] === false || pvc.values[i] === true) {
            foundBooleanVal = true;
          }
        }
        if (foundBooleanVal === false) {
          return false;
        }
      }
    }
    return true;
  }
}
