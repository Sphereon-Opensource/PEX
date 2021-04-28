// import {Constraints} from 'pe-models';
//
// import {Predicate, Validation} from '../core';
//
// import {ValidationBundler} from './validationBundler';
//
// export class ConstraintsVB extends ValidationBundler<Constraints> {
//
//   private readonly msg = 'message';
//
//   constructor(parentTag: string) {
//     super(parentTag, 'constraints');
//   }
//
//   public getValidations(constraints: Constraints): Validation<Constraints>[] {
//     return [
//       [
//         this.getTag(),
//         constraints,
//         this.validation(),
//         this.msg,
//       ]
//     ];
//   }
//
//   private validation() {
//     return (constraints: Constraints): boolean => {
//       return false;
//     };
//   }
// }
