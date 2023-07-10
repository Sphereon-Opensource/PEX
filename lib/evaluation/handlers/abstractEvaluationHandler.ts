import { JSONPath as jp } from '@astronautlabs/jsonpath';
import { InputDescriptorV1, InputDescriptorV2, PresentationSubmission } from '@sphereon/pex-models';
import { WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition } from '../../types';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';

import { EvaluationHandler } from './evaluationHandler';

export abstract class AbstractEvaluationHandler implements EvaluationHandler {
  private nextHandler: EvaluationHandler | undefined;

  constructor(private _client: EvaluationClient) {}

  public setNext(handler: EvaluationHandler): EvaluationHandler {
    this.nextHandler = handler;
    return handler;
  }

  public abstract getName(): string;

  public getNext(): EvaluationHandler | undefined {
    return this.nextHandler;
  }

  public hasNext(): boolean {
    return this.nextHandler != undefined;
  }

  public get client(): EvaluationClient {
    return this._client;
  }

  public abstract handle(d: IInternalPresentationDefinition, p: WrappedVerifiableCredential[]): void;

  public get wrappedVcs(): WrappedVerifiableCredential[] {
    return this._client.wrappedVcs;
  }

  public set wrappedVcs(wrappedVcs: WrappedVerifiableCredential[]) {
    this._client.wrappedVcs = wrappedVcs;
  }

  public get presentationSubmission(): PresentationSubmission {
    return this._client.presentationSubmission;
  }

  public set presentationSubmission(presentationSubmission: PresentationSubmission) {
    this._client.presentationSubmission = presentationSubmission;
  }

  public getResults(): HandlerCheckResult[] {
    return this._client.results;
  }

  public updatePresentationSubmission(pd: IInternalPresentationDefinition) {
    this._client.assertPresentationSubmission();
    this.presentationSubmission.descriptor_map.forEach((descriptor, index, descriptorMap) => {
      /**
         * TODO map the nested credential
         let vcPath = jp.stringify(e.payload.result.path)
         */
      let inputDescriptor: InputDescriptorV1 | InputDescriptorV2;
      const result = this.getResults()
        .filter((r) => r.status === Status.ERROR && r.evaluator === this.getName())
        .find((result) => {
          inputDescriptor = jp.query(pd, result.input_descriptor_path)[0];
          return result.verifiable_credential_path === descriptor.path && inputDescriptor?.id === descriptor.id;
        });
      if (result) {
        delete descriptorMap[index];
      }
    });
  }

  public removeDuplicate(results: HandlerCheckResult[]) {
    return results.reduce((arr: HandlerCheckResult[], cur: HandlerCheckResult) => {
      const result = arr.find(
        (i) => i.input_descriptor_path === cur.input_descriptor_path && i.verifiable_credential_path === cur.verifiable_credential_path,
      );
      if (!result) {
        return arr.concat([cur]);
      } else {
        return arr;
      }
    }, []);
  }
}
