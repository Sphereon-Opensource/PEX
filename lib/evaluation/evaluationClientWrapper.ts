import { PresentationDefinition } from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';

import { EvaluationClient } from './evaluationClient';
import { EvaluationResults } from './evaluationResults';

export class EvaluationClientWrapper {
  private _client: EvaluationClient;

  constructor() {
    this._client = new EvaluationClient();
  }

  public getEvaluationClient() {
    return this._client;
  }

  public evaluate(pd: PresentationDefinition, vp: unknown): EvaluationResults {
    this._client.evaluate(pd, vp);
    const result: any = {};
    result.warnings = this.formatNotInfo(Status.WARN);
    result.errors = this.formatNotInfo(Status.ERROR);
    if (this._client.verifiablePresentation['presentationSubmission']['descriptor_map'].length) {
      result.value = this._client.verifiablePresentation['presentationSubmission'];
    }
    return result;
  }

  private formatNotInfo(status: Status): Checked[] {
    return this._client.results
      .filter((result) => result.status === status)
      .map((x) => {
        return {
          tag: x.evaluator,
          status: x.status,
          message: `${x.message}: ${x.input_descriptor_path}: ${x.verifiable_credential_path}`,
        };
      });
  }
}
