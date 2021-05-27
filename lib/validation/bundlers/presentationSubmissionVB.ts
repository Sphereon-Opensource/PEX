import fs from 'fs';

import { PresentationDefinition, PresentationSubmission } from '@sphereon/pe-models';
import Ajv from 'ajv';

import { Predicate, Validation } from '../core';

import { ValidationBundler } from './validationBundler';

export class PresentationSubmissionVB extends ValidationBundler<PresentationSubmission> {
  private ajv: Ajv;

  constructor(parentTag: string) {
    super(parentTag, 'presentation_submission');
    this.ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  }

  public getValidations(ps: PresentationSubmission): Validation<unknown>[] {
    return [
      {
        tag: this.getTag(),
        target: ps,
        predicate: (pd) => pd != null,
        message: 'presentation_submission should be non null.',
      },
      {
        tag: this.getTag(),
        target: ps,
        predicate: this.shouldBeAsPerJsonSchema(),
        message: 'presentation_submission should be as per json schema.',
      },
    ];
  }

  private shouldBeAsPerJsonSchema(): Predicate<unknown> {
    return (presentationDefinition: PresentationDefinition): boolean => {
      const presentationDefinitionSchema = JSON.parse(
        fs.readFileSync('json_schemas/presentation_submission.schema.json', 'utf-8')
      );

      const validate = this.ajv.compile(presentationDefinitionSchema);
      const valid = validate(presentationDefinition);

      if (!valid) {
        console.log(validate.errors);
        return false;
      }

      return true;
    };
  }
}

// presentation_submission MUST be at the location described in the Embed Locations table.
// MUST id property UUID
// MUST definition_id a valid Presentation Definition

// MUST descriptor_map array
// + The descriptor_map object MUST include an id property. The value of this property MUST be a string that matches the id property of the Input Descriptor (#term:input-descriptor) in the Presentation Definition (#term:presentation-definition) that this Presentation Submission (#term:presentation-submission) is related to.
// + format MUST one of the Claim Format Designation
// + MUST path MUST JSONPath
// + MAY path_nested
//   o The format of a path_nested object mirrors that of a descriptor_map property. The nesting may be any number of levels deep. The id property MUST be the same for each level of nesting.
//   o The path property inside each path_nested property provides a relative path within a given nested value.
//
//   When the path_nested property is present in a Presentation Submission (#term:presentation-submission) object, process as follows:
// 1. For each Nested Submission Traversal Object in the path_nested array:
//   1. Execute the JSONPath (https://goessner.net/articles/JsonPath/) expression string on the Current Traversal Object (#current-traversal-object) , or if none is designated, the top level of the Embed Target.
// 2. Decode and parse the value returned from JSONPath (https://goessner.net/articles/JsonPath/) execution in accordance with the Claim Format Designation (#claim-format-designations) specified in the object’s format property. If the value parses and validates in accordance with the Claim Format Designation (#claim-format-designations) specified, let the resulting object be the Current Traversal Object (#current-traversal-object)
// 3. If present, process the next Nested Submission Traversal Object in the current path_nested property.
// 2. If parsing of the Nested Submission Traversal Objects in the path_nested property produced a valid value, process it as the submission against the Input Descriptor (#term:input-descriptor) indicated by the id property of the containing Input Descriptor Mapping Object.
//
//
// ** § (#limited-disclosure-submissions) Limited Disclosure Submissions
// ------------------------------------------------------------
//
//   For all Claims (#term:claims) submitted in relation to Input Descriptor Objects (#term:input-descriptor-objects) that include a constraints object with a limit_disclosure property set to the string value required, ensure that the data submitted is limited to the entries specified in the fields property of the constraints object. If the fields property is not present, or contains zero field objects, the submission SHOULD NOT include any data from the Claim (#term:claim) . For example, a Verifier (#term:verifier) may simply want to know whether a Holder (#term:holder) has a valid, signed Claim (#term:claim) of a particular type, without disclosing any of the data it contains.

// OpenID   top-level
// DIDComms $.presentations~attach.data.json
// VP       top-level
// CHAPI    $.data
//
