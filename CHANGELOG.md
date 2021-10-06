# Release Notes
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
This is the second Beta release of the Presentation Exchange typescript library. Please note that the interfaces might still slightly change as the software still is in active development.

- Fixed:
  * strict flag in projects gave errors on pe-js

  
## v0.1.0 - 2021-09-03
This is the first Beta release of the Presentation Exchange typescript library. Please note that the interfaces might still slightly change as the software still is in active development.

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
This is the first Alpha release of the Presentation Exchange typescript library. Please note that the interfaces might still change a bit as the software still is in active development.

- Alpha release:
  * Input Evaluation
  * Credential Query (partially available)
  * Utilities

- Planned for Beta:
  * pejs.selectFrom() method
