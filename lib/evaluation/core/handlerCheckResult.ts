import { Status } from '../../ConstraintUtils';

export interface HandlerCheckResult {
  input_descriptor_path: string;
  verifiable_credential_path: string;
  evaluator: string;
  status: Status;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export const HandlerCheckResult = class implements HandlerCheckResult {
  public input_descriptor_path: string;
  public verifiable_credential_path: string;
  public evaluator: string;
  public status: Status;
  public message?: string;
  public payload?: unknown;

  public constructor(
    input_descriptor_path: string,
    verifiable_credential_path: string,
    evaluator: string,
    status: Status,
    message?: string,
    payload?: unknown,
  ) {
    this.input_descriptor_path = input_descriptor_path;
    this.verifiable_credential_path = verifiable_credential_path;
    this.evaluator = evaluator;
    this.status = status;
    this.message = message;
    this.payload = payload;
  }
};
