import { PresentationDefinition } from '@sphereon/pe-models';

import { VerifiablePresentation } from '../../verifiablePresentation';
import { EvaluationClient } from '../evaluationClient';
import { HandlerCheckResult } from '../handlerCheckResult';

import { EvaluationHandler } from './evaluationHandler';

export abstract class AbstractEvaluationHandler implements EvaluationHandler {
  private nextHandler: EvaluationHandler;

  constructor(private _client: EvaluationClient) {}

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

  public abstract handle(d: PresentationDefinition, p: VerifiablePresentation): void;

  public get verifiablePresentation(): VerifiablePresentation {
    return this.client.verifiablePresentation;
  }

  public set verifiablePresentation(verifiablePresentation: VerifiablePresentation) {
    this.client.verifiablePresentation = verifiablePresentation;
  }

  public getResults(): HandlerCheckResult[] {
    return this.client.results;
  }
}
