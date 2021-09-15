# Release Notes

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
