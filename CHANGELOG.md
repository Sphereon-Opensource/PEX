# Release Notes
---
**Breaking change: class and package renamed as of v0.6.0!**

As part of introducing IPresentation Exchange v1 and v2 feature based detection support to our IPresentation Exchange
library and not reaching version 1.X yet, we decided to change the name of both the package and the main entry class:
- The package was changed from `@sphereon/pe-js` to `@sphereon/pex`
- The main class was changed from `PEJS` to `PEX`. The latter class has internal feature detection support on the
  provided definition, delegating the actual implementation to the new `PEXv1` or `PEXv2` class internally. If you don't
  want the automatic feature detection you can also choose to use the `PEXv1` and `PEXv2` classes directly.

---

## v0.6.2 - 2021-12-31
No exports of internal structures anymore. Split internal and external interfaces and types

- Changed:
  - Moved internal types to separate file
  - Only export external interfaces and types

## v0.6.1 - 2021-12-31
Small improvements in the ICredential interfaces, removal of exposure of internal structures in the PEX class. Small bugfixes

- Changed:
  - Next to `@context` evaluation for V1 schema values, we now look at the `credentialSchema`
  - Seperated Credentials and IVerifiableCredential public interfaces into JSON-LD and JWT versions

- Fixed:
  - We were exposing some internal structures in the PEX class
  - Group validation assumed an array being present, which could be a string

## v0.6.0 - 2021-12-29
Add IPresentation Exchange v2 support, separating JWT Verifiable Credentials and JSON-LD VerifiableCredentials

**Breaking change: class and package renamed in v0.6.0!**
As part of introducing IPresentation Exchange v1 and v2 feature based detection support to our IPresentation Exchange
library and not reaching version 1.X yet, we decided to change the name of both the package and the main entry class:

- The package was changed from `@sphereon/pe-js` to `@sphereon/pex`
- The main class was changed from `PEJS` to `PEX`. The latter class has internal feature detection support on the
  provided definition, delegating the actual implementation to the new `PEXv1` or `PEXv2` class internally. If you don't
  want the automatic feature detection you can also choose to use the `PEXv1` and `PEXv2` classes directly.


- Added:
  - presentation exchange v2 support
    - supporting method for all the previous methods in v2
    - presentation definition version discovery
    - presentation definition validator for v2
    - `frame` validation
  - Updated:
    - Json-LD and JWT verifiable credentials are separated internally
    - All the messaged now come from an enum instead of literal strings
    - Dependency versions


## v0.5.1 - 2021-12-03
Fixed json path issue in library responses. 
Added a verifiableCredential array to almost all responses that corresponds to the json paths in the same response

- Fixed:
  - json path of the verifiableCredentials, now start at presentation object root in a VP

- Updated:
  - added verifiableCredential (list) to return params of evaluatePresentation 
  - added verifiableCredential (list) to return params of evaluateCredentials
  - selectFrom response changed to have "verifiableCredential" instead of "selectableVerifiableCredential"
  - renamed matches in submissionRequirementMatches to vc_path

## v0.5.0 - 2021-11-29
Refactor verifiable presentation support using callbacks

- Added:
  - verifiablePresentationFrom method that accepts a callback function and signature proof options
  - Documentation on the above as well as general improvements

- Fixed:
  - ICredential and IPresentation interfaces were not fully conforming
  - Explicit imports and exports added
  - Selective disclosure errors fixed
  - Releases contained too many files 

## v0.4.1 - 2021-11-26
Improve selective disclosure, add sign callback, several fixes


- Added:
  - Add status object to SelectResults informing the user whether to continue submission to the verifier or not
  - Allow user to pass in ZKP based signature suite types, so that PE can determine whether limited/selective disclosure can be applied. Note you still need to create the proofs yourself
  - Create a Verifiable IPresentation with PresentationSubmission object that accepts a signature callback

- Fixed:
  - Ensure supplied params are final and not mutated
  - Limited/selective disclosure fixes

## v0.4.0 - 2021-11-26
This release has been pulled, because of issues in the release process.

## v0.3.0 - 2021-11-10
Bugfix release (refactoring)

- Fixed:
  - Remove IPresentation Definition from VP as these are separate types 
  - Fix creation of VP from submissionFrom
  - Fix sameSubject and issuerIsOwner handling 
  - Fix JSON paths in matches 
  - Fix several tests to be more strict

- Updated:
  - Remove usage of unknown/any types in favor of having interfaces and types   
  - Enable strict mode 
  - Refactoring of several classes
  - Updated readme/flows

## v0.2.4 - 2021-10-06
Bugfix release

- Fixed:
  * We returned duplicate submission requirements in some cases
  * Remove URL package import, fixes react-native support
  * Fixed 2 code-paths that could have undefined values
  
## v0.2.3 - 2021-09-23
Updated dependency and fixed schema handling

- Fixed:
  * Incorrect handling of the schema array in the submission requirements. See: https://github.com/decentralized-identity/presentation-exchange/issues/250

- Updated:
  * Dependency of tmpl updated from 1.0.4 to 1.0.5 because of a CVE

## v0.2.2 - 2021-09-15
Make project compatible with browsers / react

- Fixed:
  * Make compatible with browsers/react

## v0.2.1 - 2021-09-15
Updated dependencies and some forgotten expression changes

- Changed:
  * Updated all dependencies
  
- Fixed:
  * Remove usage of &&= in all expressions

## v0.2.0 - 2021-09-15
Some fixes regarding usage in React. Better error handling

- Fixed:
  * Remove usage of &&= in expressions
  * Restrict usage of fs to tests only, so not used at runtime
  * Move errors from strings to an object

- Added:
  * Return stacktraces

## v0.1.1 - 2021-09-09
This is the second Beta release of the IPresentation Exchange typescript library. Please note that the interfaces might still slightly change as the software still is in active development.

- Fixed:
  * strict flag in projects gave errors on PEX

  
## v0.1.0 - 2021-09-03
This is the first Beta release of the IPresentation Exchange typescript library. Please note that the interfaces might still slightly change as the software still is in active development.

- Added:
  * pejs.selectFrom() method


- Fixed:
  * submissionFrom should use results from evaluate
  * validateSubmission should be successfully called


- Known issues:
  1. Implementation of actual hashlink validation, according to [DIF documentation](https://identity.foundation/presentation-exchange/#input-evaluation) is missing
     >4.3.1- If the Input Descriptor schema object uri is a hashlink or similar value that points to immutable content, then the content of the retrieved schema must also match
  
  2. Some entries in [DIF documentation](https://identity.foundation/presentation-exchange/#input-evaluation) are addressing `nested credentials` and `nested paths`, which are currently only partially supported.




## v0.0.1 - 2021-08-17
This is the first Alpha release of the IPresentation Exchange typescript library. Please note that the interfaces might still change a bit as the software still is in active development.

- Alpha release:
  * Input Evaluation
  * ICredential Query (partially available)
  * Utilities

- Planned for Beta:
  * pejs.selectFrom() method
