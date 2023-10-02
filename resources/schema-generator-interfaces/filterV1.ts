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
    type: string;
}
