import { JSONPath as jp } from '@astronautlabs/jsonpath';
import { HolderSubject, Optionality } from '@sphereon/pex-models';
import { WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition, PathComponent } from '../../types';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class SameSubjectEvaluationHandler extends AbstractEvaluationHandler {
  private fieldIds: { path: PathComponent[]; value: string }[];
  private sameSubject: { path: PathComponent[]; value: HolderSubject }[];

  private messages: Map<Status, string>;

  constructor(client: EvaluationClient) {
    super(client);
    this.fieldIds = [];
    this.sameSubject = [];

    this.messages = new Map<Status, string>();
    this.messages.set(Status.INFO, 'The field ids requiring the same subject to belong to same subject');
    this.messages.set(Status.WARN, 'The field ids preferring the same subject to belong to same subject');
    this.messages.set(Status.ERROR, 'The fields ids not belong to the same subject');
  }

  public getName(): string {
    return 'SameSubjectEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    const sameSubjectInDesc = this.mapSameSubjectFieldIdsToInputDescriptors(pd);
    const handlerCheckResults = this.mapCredentialsToResultObjecs(wrappedVcs, sameSubjectInDesc);
    const fieldIdOccurrencesCount = this.countSameSubjectOccurrences(sameSubjectInDesc, handlerCheckResults);
    this.generateErrorResults(fieldIdOccurrencesCount, handlerCheckResults);
    this.updatePresentationSubmission(pd);
  }

  private mapSameSubjectFieldIdsToInputDescriptors(
    pd: IInternalPresentationDefinition,
  ): [{ path: PathComponent[]; value: string }, { path: PathComponent[]; value: HolderSubject }][] {
    this.fieldIds.push(...jp.nodes(pd, '$..fields[*].id'));
    this.sameSubject.push(...jp.nodes(pd, '$..same_subject[*]'));

    const results: [{ path: PathComponent[]; value: string }, { path: PathComponent[]; value: HolderSubject }][] = [];
    this.fieldIds.forEach((f) => {
      const sameSubject = this.sameSubject.find((ss) => ss.value.field_id.includes(f.value));
      if (sameSubject) {
        results.push([f, sameSubject]);
      }
    });
    return results;
  }

  private generateErrorResults(fieldIdOccurrencesCount: Map<string[], number>, handlerCheckResults: HandlerCheckResult[]) {
    fieldIdOccurrencesCount.forEach((v, k) => {
      const results = handlerCheckResults.filter((r) => k === r.payload.fieldIdSet).map((r) => r.payload.credentialSubject.id);
      if (results.length !== v || new Set(results).size !== 1) {
        handlerCheckResults.forEach((v, i, arr) => {
          if (v.payload.fieldIdSet === k) {
            v.status = Status.ERROR;
            v.message = this.messages.get(Status.ERROR);
            arr[i] = v;
          }
        });
      }
    });
    this.client.results.push(...handlerCheckResults);
  }

  private countSameSubjectOccurrences(
    sameSubjectInDesc: [{ path: PathComponent[]; value: string }, { path: PathComponent[]; value: HolderSubject }][],
    handlerCheckResults: HandlerCheckResult[],
  ) {
    const fieldIdOccurrencesCount: Map<string[], number> = new Map<string[], number>();
    sameSubjectInDesc.forEach((s) => {
      const result = handlerCheckResults.filter((c) => s[1].value.field_id === c.payload.fieldIdSet);
      if (result) {
        if (fieldIdOccurrencesCount.has(s[1].value.field_id) && fieldIdOccurrencesCount.get(s[1].value.field_id)) {
          fieldIdOccurrencesCount.set(s[1].value.field_id, (fieldIdOccurrencesCount.get(s[1].value.field_id) as number) + 1);
        } else {
          fieldIdOccurrencesCount.set(s[1].value.field_id, 1);
        }
      }
    });
    return fieldIdOccurrencesCount;
  }

  private mapCredentialsToResultObjecs(
    wrappedVcs: WrappedVerifiableCredential[],
    results: [{ path: PathComponent[]; value: string }, { path: PathComponent[]; value: HolderSubject }][],
  ): HandlerCheckResult[] {
    const subjects = [
      ...jp.nodes(
        wrappedVcs.map((wvc) => wvc.credential),
        '$..credentialSubject',
      ),
    ];
    const handlerCheckResults: HandlerCheckResult[] = [];
    subjects.forEach((s) => {
      const result = results.find((id) => jp.query(s.value, `$..${id[0].value}`).length !== 0);
      if (result && result[1].value.directive === Optionality.Required) {
        handlerCheckResults.push({
          input_descriptor_path: jp.stringify(result[0].path.slice(0, 3)),
          status: Status.INFO,
          evaluator: this.getName(),
          payload: { fieldIdSet: result[1].value.field_id, credentialSubject: s.value },
          message: this.messages.get(Status.INFO),
          verifiable_credential_path: jp.stringify(s.path.slice(0, 2)),
        });
      } else if (result && result[1].value.directive === Optionality.Preferred) {
        handlerCheckResults.push({
          input_descriptor_path: jp.stringify(result[0].path.slice(0, 3)),
          status: Status.WARN,
          evaluator: this.getName(),
          payload: { fieldIdSet: result[1].value.field_id, credentialSubject: s.value },
          message: this.messages.get(Status.WARN),
          verifiable_credential_path: jp.stringify(s.path.slice(0, 2)),
        });
      }
    });
    return handlerCheckResults;
  }
}
