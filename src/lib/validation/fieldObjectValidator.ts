interface ObjectValidator {
    validate(obj: any): boolean;
}

export class FieldObjectValidator implements ObjectValidator {
    validate(fieldObj: any): boolean {
        if (fieldObj) {
            return true;
        }
        return true;
    }
}
