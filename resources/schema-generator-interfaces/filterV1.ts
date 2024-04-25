import { OneOfNumberString } from './oneOfNumberString';
import { OneOfNumberStringBoolean } from './oneOfNumberStringBoolean';

export interface FilterV1Base {
    const?: OneOfNumberStringBoolean;
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
