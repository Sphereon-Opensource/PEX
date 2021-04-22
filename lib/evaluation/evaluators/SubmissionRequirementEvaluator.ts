/*import {SubmissionRequirement} from 'pe-models';*/

export class SubmissionRequirementEvaluator {

    _evaluate/*<Validatable>*/(/*submissionRequirement: SubmissionRequirement*/) {

        // TODO Implement tuple creation: It would have a selector/filter mechanism, predicate function and a related error or info message.
        // TODO
        // E 4.2.B.A if submissionRequirement != null all submission requirements must be fulfilled and all input descriptors must be grouped.
        // E 4.2.B.B if submissionRequirement != null whatever input descriptor remains should be ignored.

        // Note: Here is the example where it is not an error. And now want to communicate to the caller to take care of input_descriptor validation.
        //       In this case some input descriptor validations will be skipped. Implementing with exception would not be correct.

        // E 4.2.2.A.A    for rule === 'all' from - All Input Descriptors matching the group string of the from value MUST be submitted to the Verifier.
        // E 4.2.2.A.B    for rule === 'all' from_nested - All Submission Requirement Objects specified in the from_nested array must be satisfied by the inputs submitted to the Verifier.

        // E 4.2.2.B.A.B for rule === 'pick' && count !== null This indicates the number of input Descriptors or Submission Requirement Objects to be submitted.
        // E 4.2.2.B.B.B for rule === 'pick' && min !=== null then This indicates the minimum number of input Descriptors or Submission Requirement Objects to be submitted.
        // E 4.2.2.B.C.B for rule === 'pick' && max !=== null then This indicates the maximum number of input Descriptors or Submission Requirement Objects to be submitted.

        // E 4.2.2.B.D.A from - The specified number of Input Descriptors matching the group string of the from value MUST be submitted to the Verifier.
        // E 4.2.2.B.D.B from_nested - The specified number of Submission Requirement Objects in the from_nested array must be satisfied by the inputs submitted to the Verifier.

        return [

        ];
    }
}