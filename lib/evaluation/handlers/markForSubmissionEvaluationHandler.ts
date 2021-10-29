import { Descriptor, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import jp from 'jsonpath';
import { nanoid } from 'nanoid';

import { Status } from '../../ConstraintUtils';
import { VerifiableCredential } from '../../verifiablePresentation';
import { EvaluationClient } from '../evaluationClient';
import { HandlerCheckResult } from '../handlerCheckResult';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class MarkForSubmissionEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'MarkForSubmissionEvaluation';
  }

  public handle(pd: PresentationDefinition, vcs: VerifiableCredential[]): void {
    const results: HandlerCheckResult[] = [...this.getResults()];
    const errors: HandlerCheckResult[] = results.filter((result: HandlerCheckResult) => result.status === Status.ERROR);
    const infos: HandlerCheckResult[] = this.retrieveNoErrorStatus(results, errors); //Need to have the whole chain to this point
    //Use the filter evaluation result to remove duplication and extract nested credentials?
    const descriptorMap: Descriptor[] = infos
      .filter((e) => e.evaluator === 'FilterEvaluation')
      .flatMap((e) => {
        /**
       * TODO map the nested credential
      let vcPath = jp.stringify(e.payload.result.path)
       */
        const inputDescriptor: InputDescriptor = jp.nodes(pd, e.input_descriptor_path)[0].value;
        return {
          id: inputDescriptor.id,
          format: 'ldp_vc',
          path: e.verifiable_credential_path,
        };
      });
    this.presentationSubmission = {
      id: nanoid(),
      definition_id: pd.id,
      descriptor_map: descriptorMap,
    };
    this.client.verifiableCredential = vcs;

    this.produceErrorResults(errors);
    this.produceSuccessResults(infos, pd);
  }

  private retrieveNoErrorStatus(results: HandlerCheckResult[], errors: HandlerCheckResult[]) {
    const info = results.filter((e) => e.status !== Status.ERROR);
    return info.filter(
      (a) =>
        !errors.find(
          (b) =>
            a.input_descriptor_path === b.input_descriptor_path &&
            a.verifiable_credential_path === b.verifiable_credential_path
        )
    );
  }

  private produceSuccessResults(infos: HandlerCheckResult[], pd: PresentationDefinition) {
    this.removeDuplicate(infos).forEach((info) => {
      const parsedPath = jp.nodes(pd, info.input_descriptor_path);
      const group = parsedPath[0].value.group;
      this.getResults().push({
        input_descriptor_path: info.input_descriptor_path,
        verifiable_credential_path: info.verifiable_credential_path,
        evaluator: this.getName(),
        status: Status.INFO,
        payload: { group },
        message: 'The input candidate is eligible for submission',
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
        message: 'The input candidate is not eligible for submission',
        payload: payload,
      });
    });
  }

  private removeDuplicate(results: HandlerCheckResult[]) {
    return results.reduce((arr: HandlerCheckResult[], cur: HandlerCheckResult) => {
      const result = arr.find(
        (i) =>
          i.input_descriptor_path === cur.input_descriptor_path &&
          i.verifiable_credential_path === cur.verifiable_credential_path
      );
      if (!result) {
        return arr.concat([cur]);
      } else {
        return arr;
      }
    }, []);
  }
}
