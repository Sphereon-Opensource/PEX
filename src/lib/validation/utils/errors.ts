export interface Invalid {
    errorMessage: string;
}

export const Invalid = class implements Invalid {
    public errorMessage: string;
    public constructor(message: string) {
        this.errorMessage = message;
    }
};

export type InvalidOr<T> = Invalid | T;
export type Validated<T> = NonEmptyArray<Invalid> | T;
export type NonEmptyArray<T> = [T, ...T[]];
