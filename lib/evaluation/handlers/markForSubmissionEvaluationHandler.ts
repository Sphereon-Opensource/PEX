import { JSONPath as jp } from '@astronautlabs/jsonpath';
import { WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition } from '../../types/Internal.types';
import PexMessages from '../../types/Messages';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class MarkForSubmissionEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'MarkForSubmissionEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    const results: HandlerCheckResult[] = [...this.getResults()];
    const errors: HandlerCheckResult[] = results.filter((result: HandlerCheckResult) => result.status === Status.ERROR);
    const infos: HandlerCheckResult[] = this.retrieveNoErrorStatus(results, errors);
    this.client.wrappedVcs = wrappedVcs;
    this.produceErrorResults(errors);
    this.produceSuccessResults(infos, pd);
  }

  private retrieveNoErrorStatus(results: HandlerCheckResult[], errors: HandlerCheckResult[]) {
    const info = results.filter((e) => e.status !== Status.ERROR);
    return info.filter(
      (a) =>
        !errors.find((b) => a.input_descriptor_path === b.input_descriptor_path && a.verifiable_credential_path === b.verifiable_credential_path),
    );
  }

  private produceSuccessResults(infos: HandlerCheckResult[], pd: IInternalPresentationDefinition) {
    this.removeDuplicate(infos).forEach((info) => {
      const parsedPath = jp.nodes(pd, info.input_descriptor_path);
      const group = parsedPath[0].value.group;
      this.getResults().push({
        input_descriptor_path: info.input_descriptor_path,
        verifiable_credential_path: info.verifiable_credential_path,
        evaluator: this.getName(),
        status: Status.INFO,
        payload: { group },
        message: PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
      });
    });
  }

  private produceErrorResults(errors: HandlerCheckResult[]) {
    this.removeDuplicate(errors).forEach((error) => {
      const payload = { ...error.payload };
      payload.evaluator = error.evaluator;
      this.getResults().push({
        ...error,
        evaluator: this.getName(),
        message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
        payload: payload,
      });
    });
  }
}
