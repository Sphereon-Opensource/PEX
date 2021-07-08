import { Checked, NonEmptyArray } from '../../ConstraintUtils';

export type Validated = NonEmptyArray<Checked> | Checked;
