enum PexMessages {
  INPUT_CANDIDATE_DOESNT_CONTAIN_PROPERTY = 'Input candidate does not contain property',
  INPUT_CANDIDATE_FAILED_FILTER_EVALUATION = 'Input candidate failed filter evaluation',
  INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION = 'The input candidate is eligible for submission',
  INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION = 'The input candidate is not eligible for submission',
  INPUT_DESCRIPTOR_CONTEXT_CONTAINS_HASHLINK_VERIFICATION_NOT_SUPPORTED = "Input descriptor contains hashlink. This version doesn't support hashlink verification.",
  LIMIT_DISCLOSURE_APPLIED = 'added variable in the limit_disclosure to the verifiableCredential',
  LIMIT_DISCLOSURE_NOT_SUPPORTED = 'Limit disclosure not supported',
  SUBJECT_IS_NOT_ISSUER = 'subject is not issuer',
  SUBJECT_IS_ISSUER = 'subject is issuer',
  FORMAT_RESTRICTION_PASSED = 'the Credential format of the candidate inputs matches the required formats',
  FORMAT_RESTRICTION_DIDNT_PASS = "the Credential format of the candidate inputs didn't match the required formats",
  URI_EVALUATION_PASSED = '@context URI(s) for the schema of the candidate input is equal to one of the input_descriptors object uri values.',
  URI_EVALUATION_DIDNT_PASS = '@context URI for the of the candidate input MUST be equal to one of the input_descriptors object uri values exactly.',
  UNKNOWN_EXCEPTION = 'unknown exception occurred: ',
  VERIFIABLE_CREDENTIAL_MANDATORY_FIELD_NOT_PRESENT = 'mandatory field not present in the verifiableCredential',
}

export default PexMessages;
