export interface Invalid {
  errorMessage: string;
}

export const Invalid = class implements Invalid {
  errorMessage: string;
  source: Error;

  constructor(message: string, source?: Error) {
    this.errorMessage = message;
    this.source = source;
  }
};

export type InvalidOr<T> = Invalid | T;
export type Validated<T> = NonEmptyArray<Invalid> | T;
export type NonEmptyArray<T> = [T, ...T[]];
