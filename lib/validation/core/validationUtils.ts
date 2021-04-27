import { Checked, Status } from './validated';

type AreInvalid = (checked: Checked[]) => boolean;

export const hasErrors: AreInvalid = (checked: Checked[]): boolean => {
  function isError(chk: Checked): boolean {
    return chk.status === Status.ERROR;
  }

  return (checked as Checked[]).filter((chk) => isError(chk)).length > 0;
};
