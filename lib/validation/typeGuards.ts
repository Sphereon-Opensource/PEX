import { Field } from 'pe-models';

export function isField(obj: any): obj is Field {
  return 'path' in obj;
}
