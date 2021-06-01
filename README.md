# PE-JS

The Presentation Exchange Library is a general use library that implements the functionality described in
the [DIF Presentation Exchange](https://identity.foundation/presentation-exchange/) specification. It is written in
Typescript and can be compiled to any target Javascript version. It has been built to be compatible with browsers,
mobile and NodeJS environments.

## For PE-JS developers

This project has been created using:
* `yarn` version 1.22.5
* `node` version 12.22.1

### Install
```shell
yarn install
```
### Build
```shell
yarn build
```
### Test
The test command runs:
* `eslint`
* `prettier`
* `unit`

You can also run only a single section of these tests, using for example `yarn test:unit`.
```shell
yarn test
```

### Utility scripts
There are several other utility scripts that help with development.

* `yarn fix` - runs `eslint --fix` as well as `prettier` to fix code style
* `yarn cov` - generates code coverage report


## For PE-JS Users

The library can be installed direction from npmjs via:

```shell
# install via yarn
yarn add pe-js

# install via npm
npm install pe-js
```

The core functionality of the DIF Presentation Exchange can be outlined as follows:

* Input Evaluation
* Credential Query
* Utilities

#### Input Evaluation
Input evaluation is the primary mechanism by which a verifier determines whether a presentation submission from a holder matches the requested presentation definition from the request.
```typescript
import pejs from 'pe-js';

const presentationDefinition = {
  "id": "32f54163-7166-48f1-93d8-ff217bdb0653",
  "input_descriptors": [
    {
      "id": "wa_driver_license",
      "name": "Washington State Business License",
      "purpose": "We can only allow licensed Washington State business representatives into the WA Business Conference",
      "schema": [{
        "uri": "https://licenses.example.com/business-license.json"
      }]
    }
  ]
};

const verifiablePresentation = {
  '@context': [
    "https://www.w3.org/2018/credentials/v1",
    "https://identity.foundation/presentation-exchange/submission/v1"
  ],
  type: [
    "VerifiablePresentation",
    "PresentationSubmission"
  ],
  presentation_submission: {...},
  verifiableCredential: [...],
  proof: {...}
}

const {value, warnings, errors} = pejs.evaluate(presentationDefinition, verifiablePresentation);
```

#### Credential Query
A credential query allows holders to filter their set of credentials for matches to a given presentation definition.
```typescript
import pejs from 'pe-js';

// Definition from verifier request
const presentationDefinition = {
  ...
};

// Example for loading credentials
const credentials = await secureStore.getCredentials();

// Find matching credentials
const srMatches = pejs.selectFrom(presentationDefinition, credentials);

// An example that selects the first 'count' credentials from
// the matches. in a real scenario, the user has to select what 
// to disclose
const selectedCredentials = srMatches.map(
  ({matches, count}) => matches.slice(0, count)
).flat();

// Construct presentation submission from selected credentials
const presentationSubmission = pejs.submissionFrom(presentationDefinition, selectedCredentials);

const presentation = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://identity.foundation/presentation-exchange/submission/v1"
  ],
  "type": [
    "VerifiablePresentation",
    "PresentationSubmission"
  ],
  presentation_submission: presentationSubmission,
  verifiableCredential: selectedCredentials
};

// Presentation would be signed and sent to verifier
```

#### Utilities
In addition to the core functionality above, the underlying validation methods are exposed as low-level helper functions.
```typescript
import pejs from 'pe-js';

const presentationDefinition = {
  ...
};

const {warnings: pdWarnings, errors: pdErrors} = pejs.validate(presentationDefinition);

const presentationSubmission = {
  ...
};

const {warnings: psWarnings, errors: psErrors} = pejs.validate(presentationSubmission);
```

## API

### Evaluate
```typescript
evaluate(presentationDefinition, verifiablePresentation)
```
##### Description
Evaluates whether a presentation submission meets the requested presentation definition

#### Parameters
| name | type | description|
|------|------|------------|
| `presentationDefinition` | `PresentationDefinition` | the presentation definition that initiated the request from the verifier |
| `verifiablePresentation` | `VerifiablePresentation` | the VP containing the required credentials and a `presentation_submission` object mapping back to the presentation definition |

#### Return value
If evaluation is successful, `value` will be a non-null `PresentationSubmission` mapping the submitted credentials to the requested inputs.
```typescript
interface EvaluationResults {
  value?: PresentationSubmission;
  warnings?: string[];
  errors?: Error[];
}
```

### SelectFrom
```typescript
selectFrom(presentationDefinition, credentials)
```
##### Description
Gathers the matching credentials that fit a given presentation definition

#### Parameters
| name | type | description|
|------|------|------------|
| `presentationDefinition` | `PresentationDefinition` | the presentation definition that initiated the request from the verifier |
| `credentials` | `VerifiableCredential[]` | the array of verifiable credentials to select from |

#### Return value
If selection is successful or partially successful, `matches` will be a non-null array of `SubmissionRequirementMatch` object representing the matching credentials for each `SubmissionRequirement` in the `presentationDefinition` input parameter.
```typescript
interface SelectResults {
  matches?: SubmissionRequirementMatch[];
  warnings?: string[];
}

interface SubmissionRequirementMatch {
  name: string;
  rule: Rule;
  count: number;
  from?: string[];
  from_nested?: SubmissionRequirementMatch[];
  matches: VerifiableCredential[];
}
```

### SubmissionFrom
```typescript
submissionFrom(presentationDefinition, selectedCredentials)
```
##### Description
Creates the corresponding Presentation Submission object to be included in the Verifiable Presentation response, which maps the submitted credentials to the requested inputs in the `presentationDefinition` input parameter.

#### Parameters
| name | type | description|
|------|------|------------|
| `presentationDefinition` | `PresentationDefinition` | the presentation definition that initiated the request from the verifier |
| `selectedCredentials` | `VerifiableCredential[]` | the array of verifiable credentials that meet the submission requirements in the presentation definition |

#### Return value
If the selected credentials successfully match the submission requirements in the presentation definition, the return value will be a non-null `PresentationSubmission`
```typescript
interface PresentationSubmission {
  id?: string;
  definition_id: string;
  descriptor_map: Descriptor[]
}
```

### Validation
```typescript
validate(objToValidate)
```
#### Description
A validation utility function for `PresentationDefinition` and `PresentationSubmission` objects.

#### Parameters
| name | type | description|
|------|------|------------|
| `objToValidate` | <code>PresentationDefinition &#124; PresentationSubmission</code> | the presentation definition or presentation definition to be validated |

#### Return value
The `validate` method returns a validation report, with structure:
```typescript
interface ValidationReport {
  warnings: string[];
  errors: Error[];
}
```
`warnings` lists recommended structure violations and `errors` lists required structure violations according to the DIF PE specification.
