import {SubmissionRequirement} from 'pe-models';
import {executeValidations, Predicate} from '../core/executeValidations';

export class SubmissionRequirementValidations {

    _validate(srs: SubmissionRequirement[]) {

        const ruleIsMandatory = 'rule is a mandatory field';
        const needsEitherFromOrFromNested = 'either \'from\' or \'from_nested\' should be present';
        const fromOrFromNestedIsMandatory = 'At least one of the two i.e. \'from\' or \'from_nested\' should be present';
        const fromNestedShouldBeArray = 'The value of the from_nested property MUST be an array';
        const areAllOfTypeSubmissionRequirement = 'The values of the from_nested array MUST be of type \'SubmissionRequirement\'';
        const isHumanFriendlyString = '\'name\' must be clearly read and understandable by humans';
        const isCountAPracticlePositiveInteger = '\'count\' must be a practicle positive number';
        const isMinAPracticlePositiveInteger = '\'min\' must be a practicle positive number';
        const isMaxAPracticlePositiveInteger = '\'max\' must be a practicle positive number';
        const ruleShouldBePickOrAll = '\'rule\' should be either \'pick\' or \'all\'';

        for (let sr of srs) {

            executeValidations(
                sr,
                [
                    [this.ruleIsMandatory(), ruleIsMandatory],// Validation 4.2.1.A
                    [this.needsEitherFromOrFromNested(), needsEitherFromOrFromNested],// Validation 4.2.1.B.A
                    [this.fromOrFromNestedIsMandatory(), fromOrFromNestedIsMandatory],// Validation 4.2.1.B.B
                    [this.fromNestedShouldBeArray(), fromNestedShouldBeArray],// Validation 4.2.1.D
                    // TODO Validation 4.2.1.E See if it can be implemented in pe-api yamls. currently in typescript type of this variable is 'any' i.e. from_nested?: Array<object>;
                    [this.allNestedSubmissionRequirementsValidations(), areAllOfTypeSubmissionRequirement],// Validation 4.2.1.F
                    [this.isHumanFriendlyString(), isHumanFriendlyString],// Validation 4.2.1.G
                    [this.isCountAPracticlePositiveInteger(), isCountAPracticlePositiveInteger],// Validation 4.2.2.B.A.A
                    [this.isMinAPracticlePositiveInteger(), isMinAPracticlePositiveInteger],// Validation 4.2.2.B.B.A
                    [this.isMaxAPracticlePositiveInteger(), isMaxAPracticlePositiveInteger],// Validation 4.2.2.B.C.A
                    [this.ruleShouldBePickOrAll(), ruleShouldBePickOrAll]// Validation 4.2.4
                ]
            );

        }
    }

    allNestedSubmissionRequirementsValidations(): Predicate<SubmissionRequirement> {
        // TODO [Hafeez] [fix] Validation 4.2.1.F check from_nested recursively.
        return (sr: SubmissionRequirement) =>
            sr !== sr;
    }

    isHumanFriendlyString(): Predicate<SubmissionRequirement> {
        return (sr: SubmissionRequirement) =>
            sr.name === sr.name; // Just a place holder so that following can be implemented more easily if decided.

        // We can define
        //      min length
        //      max length
        //      char encoding UTF-8
        //      char set
        //          0-1
        //          a-z
        //          A-Z
        //          `-=[]\;',./~!@#$%^&*()_+{}|:"<>?
    }

    isCountAPracticlePositiveInteger(): Predicate<SubmissionRequirement> {
        return (sr: SubmissionRequirement) =>
            sr.rule === 'pick' &&
            typeof sr.count === "number" &&
            0 < sr.count &&
            sr.count < 1000; // only this line is an assumption taken
    }

    isMinAPracticlePositiveInteger(): Predicate<SubmissionRequirement> {
        return (sr: SubmissionRequirement) =>
            sr.rule === 'pick' &&
            typeof sr.min === "number" &&
            0 < sr.min &&
            sr.min < 1000; // only this line is an assumption taken
    }

    isMaxAPracticlePositiveInteger(): Predicate<SubmissionRequirement> {
        return (sr: SubmissionRequirement) =>
            sr.rule === 'pick' &&
            typeof sr.max === "number" &&
            0 < sr.max &&
            sr.max < 1000; // only this line is an assumption taken
    }

    private ruleIsMandatory() {
        return (sr: SubmissionRequirement): boolean =>
            sr.rule !== undefined;
    }

    private needsEitherFromOrFromNested() {
        return (sr: SubmissionRequirement): boolean =>
            sr.from !== null && sr.from_nested !== null;
    }

    private fromOrFromNestedIsMandatory() {
        return (sr: SubmissionRequirement): boolean =>
            sr.from === null && sr.from_nested === null;
    }

    private fromNestedShouldBeArray() {
        return (sr: SubmissionRequirement): boolean =>
            Array.isArray(sr.from_nested);
    }

    private ruleShouldBePickOrAll() {
        return (sr: SubmissionRequirement): boolean =>
            sr.rule === 'pick' || sr.rule === 'all';
    }

}
