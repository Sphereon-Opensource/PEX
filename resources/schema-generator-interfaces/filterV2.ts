import { OneOfNumberString } from './oneOfNumberString';

export interface FilterV2Base {
    const?: OneOfNumberString;
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
    contains?: FilterV2Base;
    items?: FilterV2 | [FilterV2, ...FilterV2[]];
    type?: string;
}

export interface FilterV2 extends FilterV2Base {
    type: string;
}
