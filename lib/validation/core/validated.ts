export type Status = 'info' | 'warn' | 'error';

export const Status = {
  INFO: 'info' as Status,
  WARN: 'warn' as Status,
  ERROR: 'error' as Status,
};

export interface Checked {
  tag: string;
  status: Status;
  message?: string;
}

export const Checked = class implements Checked {
  public tag: string;
  public status: Status;
  public message?: string;

  public constructor(tag: string, status: Status, message?: string) {
    this.tag = tag;
    this.status = status;
    this.message = message;
  }
};

export type Validated = NonEmptyArray<Checked> | Checked;
export type NonEmptyArray<T> = [T, ...T[]];
