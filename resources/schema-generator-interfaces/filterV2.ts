import { OneOfNumberString } from './oneOfNumberString';
import { OneOfNumberStringBoolean } from './oneOfNumberStringBoolean';

export interface FilterV2 {
    const?: OneOfNumberStringBoolean;
    enum?: Array<OneOfNumberString>;
    exclusiveMinimum?: OneOfNumberString;
    exclusiveMaximum?: OneOfNumberString;
    format?: string;
    formatMaximum?: string;
    formatMinimum?: string;
    formatExclusiveMaximum?: string;
    formatExclusiveMinimum?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: OneOfNumberString;
    maximum?: OneOfNumberString;
    not?: object;
    pattern?: string;
    contains?: FilterV2;
    items?: FilterV2 | [FilterV2, ...FilterV2[]];
    type?: string;
}
