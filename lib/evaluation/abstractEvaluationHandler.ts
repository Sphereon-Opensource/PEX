import { PresentationDefinition } from '@sphereon/pe-models';

import { EvaluationClient } from './evaluationClient';
import { EvaluationHandler } from './evaluationHandler';
import { HandlerCheckResult } from './handlerCheckResult';

export abstract class AbstractEvaluationHandler implements EvaluationHandler {
  private nextHandler: EvaluationHandler;

  private _client: EvaluationClient;

  constructor(client: EvaluationClient) {
    this._client = client;
  }

  public setNext(handler: EvaluationHandler): EvaluationHandler {
    this.nextHandler = handler;
    return handler;
  }

  public abstract getName(): string;

  public getNext(): EvaluationHandler {
    return this.nextHandler;
  }

  public hasNext(): boolean {
    return this.nextHandler != undefined;
  }

  public get client(): EvaluationClient {
    return this._client;
  }

  public set client(client: EvaluationClient) {
    this._client = client;
  }

  public abstract handle(d: PresentationDefinition, p: unknown): void;

  public get verifiablePresentation(): any {
    return this.client.verifiablePresentation;
  }
  public get results(): HandlerCheckResult[] {
    return this.client.results;
  }
}
