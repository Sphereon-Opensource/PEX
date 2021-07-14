import {Field, InputDescriptor} from '@sphereon/pe-models';

import {Evaluation} from '../core';

import {EvaluationBundler} from './evaluationBundler';

export class PredicateEB extends EvaluationBundler<InputDescriptor[], any> {
    constructor(parentTag: string) {
        super(parentTag, 'input_descriptor');
    }

    public getEvaluations(inputDescriptors: InputDescriptor[], p: any): Evaluation<InputDescriptor[], any>[] {
        return [...this.myEvaluations(inputDescriptors, p)];
    }

    private myEvaluations(d: InputDescriptor[], p: any): Evaluation<InputDescriptor[], any>[] {
        return [
            // E Section 4.3.1   : The URI for the schema of the candidate input MUST match one of the Input Descriptor schema object uri values exactly.
            {
                tag: this.getTag(),
                target: {d, p},
                predicate: () => d != null,
                message: 'fields should be non null.',
            },
            {
                tag: this.getTag(),
                target: {d, p},
                predicate: PredicateEB.ifPredicateIsPresentFilterShouldBePresent(),
                message: 'if in the field we have predicate value, the filter value should be present as well.',
            },
            {
                tag: this.getTag(),
                target: {d, p},
                predicate: PredicateEB.predicateValueShouldBeOfTypeOptionality(),
                message: 'predicate value should be of type \'optionality\'.',
            },
            {
                tag: this.getTag(),
                target: {d, p},
                predicate: PredicateEB.predicateRelatedFieldShouldBeBoolean(),
                message: 'verifiableCredential\'s matching predicate property should be boolean',
            },
        ];
    }

    private static ifPredicateIsPresentFilterShouldBePresent(): (inputDescriptors: InputDescriptor[]) => boolean {
        return (inputDescriptors: InputDescriptor[]): boolean => {
            for (let i = 0; i < inputDescriptors.length; i++) {
                let inputDescriptor: InputDescriptor = inputDescriptors[i];
                for (let j = 0; j < inputDescriptor.constraints.fields.length; j++) {
                    let field: Field = inputDescriptor.constraints.fields[j];
                    if (field.predicate) {
                        return field.filter != null;
                    }
                }
            }

            return true;
        };
    }

    private static predicateValueShouldBeOfTypeOptionality(): (inputDescriptors: InputDescriptor[]) => boolean {
        return (inputDescriptors: InputDescriptor[]): boolean => {
            for (let i = 0; i < inputDescriptors.length; i++) {
                let inputDescriptor: InputDescriptor = inputDescriptors[i];
                for (let j = 0; j < inputDescriptor.constraints.fields.length; j++) {
                    let field: Field = inputDescriptor.constraints.fields[j];
                    if (field.predicate) {
                        return field.predicate === ('required' || 'preferred')
                    }
                }
            }
            return true;
        };
    }

    private static predicateRelatedFieldShouldBeBoolean(): (inputDescriptors: InputDescriptor[], verifiablePresentation: unknown) => boolean {
        return (inputDescriptors: InputDescriptor[], verifiablePresentation: any): boolean => {
            for (let i = 0; i < inputDescriptors.length; i++) {
                let inputDescriptor: InputDescriptor = inputDescriptors[i];
                const predicateFields = [];
                inputDescriptor.constraints.fields.forEach(f => {
                    if (f.predicate) {
                        predicateFields.push(...f.path);
                    }
                });
                const predicateValueCandidate = [];

                predicateFields.forEach(pf => {
                    predicateValueCandidate.push({pf: pf, values: []});
                })
                verifiablePresentation.verifiableCredential.forEach(vc => {
                    predicateValueCandidate.forEach(pvc => {
                        //It's possible that for some VCs we have the boolean value for some othe VCs we have the actual value?
                        // Then we will need to check all the related paths to see if we have any boolean response for that specific field. if yes, then we're safe.
                        if (vc[pvc.pf]) {
                            pvc.values.push(vc[pvc.pf].substring(2));
                        }
                    })
                });
                for (let i = 0; i < predicateValueCandidate.length; i++) {
                    let pvc = predicateValueCandidate[i];
                    // Here we check for each entry to have at least one boolean field
                    let foundBooleanVal: boolean = false;
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
        };
    }
}
