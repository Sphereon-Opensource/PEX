/*import {SubmissionRequirement} from '@sphereon/pe-models';*/

export class SubmissionRequirementEvaluator {
  _evaluate /*<Validatable>*/(/*submissionRequirement: SubmissionRequirement*/) {
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
    // E 5  presentation_definition_id in presentation submission should match with id in presentation definition
    // E 5 descriptor_map id in presentation submission should match the id in input_descriptor in presentation definition

    // E 5
    //   When the path_nested property is present in a Presentation Submission (#term:presentation-submission) object, process as follows:
    // 1. For each Nested Submission Traversal Object in the path_nested array:
    //   1. Execute the JSONPath (https://goessner.net/articles/JsonPath/) expression string on the Current Traversal Object (#current-traversal-object) , or if none is designated, the top level of the Embed Target.
    // 2. Decode and parse the value returned from JSONPath (https://goessner.net/articles/JsonPath/) execution in accordance with the Claim Format Designation (#claim-format-designations) specified in the object’s format property. If the value parses and validates in accordance with the Claim Format Designation (#claim-format-designations) specified, let the resulting object be the Current Traversal Object (#current-traversal-object)
    // 3. If present, process the next Nested Submission Traversal Object in the current path_nested property.
    // 2. If parsing of the Nested Submission Traversal Objects in the path_nested property produced a valid value, process it as the submission against the Input Descriptor (#term:input-descriptor) indicated by the id property of the containing Input Descriptor Mapping Object.
    //

    // E 5
    // ** § (#limited-disclosure-submissions) Limited Disclosure Submissions
    // ------------------------------------------------------------
    //
    //   For all Claims (#term:claims) submitted in relation to Input Descriptor Objects (#term:input-descriptor-objects) that include a constraints object with a limit_disclosure property set to the string value required, ensure that the data submitted is limited to the entries specified in the fields property of the constraints object. If the fields property is not present, or contains zero field objects, the submission SHOULD NOT include any data from the Claim (#term:claim) . For example, a Verifier (#term:verifier) may simply want to know whether a Holder (#term:holder) has a valid, signed Claim (#term:claim) of a particular type, without disclosing any of the data it contains.

    return [];
  }
}
