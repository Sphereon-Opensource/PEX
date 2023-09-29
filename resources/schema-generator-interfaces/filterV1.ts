import { OneOfNumberString } from './oneOfNumberString';

export interface FilterV1Base {
    const?: OneOfNumberString;
    enum?: Array<OneOfNumberString>;
    exclusiveMinimum?: OneOfNumberString;
    exclusiveMaximum?: OneOfNumberString;
    format?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: OneOfNumberString;
    maximum?: OneOfNumberString;
    not?: object;
    pattern?: string;
    contains?: FilterV1Base;
    items?: FilterV1 | [FilterV1, ...FilterV1[]];
    type?: string;
}

export interface FilterV1 extends FilterV1Base {
    type: string;
}
