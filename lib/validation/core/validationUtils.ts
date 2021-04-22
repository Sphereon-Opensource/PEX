import { Invalid, NonEmptyArray, Validated } from './validationResults';

type AreInvalid<T> = (
  validatedT: Validated<T>
) => validatedT is NonEmptyArray<Invalid>;

export const areInvalid: AreInvalid<any> = (
  validatedT
): validatedT is NonEmptyArray<Invalid> => {
  function hasMessage(e): boolean {
    return e.errorMessage !== null;
  }

  if (!Array.isArray(validatedT)) {
    return false;
  }
  return (validatedT as Invalid[]).filter((e) => hasMessage(e)).length > 0;
};
