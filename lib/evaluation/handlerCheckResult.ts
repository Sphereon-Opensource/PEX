import { Status } from "../ConstraintUtils";

export interface HandlerCheckResult {
    input_descriptor_path: string;
    verifiable_credential_path: string;
    evaluator: string;
    status: Status;
    message?: string;
    payload?: any;
}