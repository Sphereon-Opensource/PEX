import { Descriptor, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import { nanoid } from 'nanoid';

import { Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { EvaluationClient } from './evaluationClient';
import { HandlerCheckResult } from './handlerCheckResult';

export class MarkForSubmissionEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
    this.getVerifiablePresentation().presentationSubmission = {};
    this.getVerifiablePresentation().presentationSubmission.descriptor_map = [];
    this.getVerifiablePresentation().presentationSubmission.id = nanoid();
  }

  public getName(): string {
    return 'MarkForSubmissionEvaluation';
  }

  public handle(pd: PresentationDefinition, p: unknown): void {
    const errors: HandlerCheckResult[] = this.removeDuplicates(
      this.getResults().filter((result) => result.status === Status.ERROR)
    );
    const results: HandlerCheckResult[] = [...this.getResults()];
    const info: HandlerCheckResult[] = this.removeDuplicates(results.filter(this.notIn(errors)));
    errors.forEach((error) => {
      const payload = { ...error.payload };
      payload.evaluator = error.evaluator;
      this.getResults().push({
        ...error,
        evaluator: this.getName(),
        message: 'The input candidate is not eligible for submission',
        payload: payload,
      });
    });
    const verifiableCredentials = this.extractVerifiableCredentials(p);
    for (const [key, value] of verifiableCredentials) {
      for (const vc of value.entries()) {
        this.createPresentationSubmission(pd, vc, info, key);
      }
    }
  }

  private extractVerifiableCredentials(inputCandidates: unknown) {
    return Object.entries(inputCandidates).filter(
      (x) => Array.isArray(x[1]) && x[1].length && typeof x[1][0] === 'object'
    ) as Array<[string, Array<unknown>]>;
  }

  private notIn(array: Array<HandlerCheckResult>): (item: any) => boolean {
    return (item: HandlerCheckResult) => {
      return !array.find(
        (e) =>
          e.input_descriptor_path === item.input_descriptor_path &&
          e.verifiable_credential_path === item.verifiable_credential_path
      );
    };
  }

  private removeDuplicates(array: HandlerCheckResult[]): HandlerCheckResult[] {
    return array.reduce((filter, current) => {
      const dk = filter.find(
        (item) =>
          item.input_descriptor_path === current.input_descriptor_path &&
          item.verifiable_credential_path === current.verifiable_credential_path
      );
      if (!dk) {
        return filter.concat([current]);
      } else {
        return filter;
      }
    }, []);
  }

  private createPresentationSubmission(pd: PresentationDefinition, vc: any, info: HandlerCheckResult[], path: string) {
    this.getVerifiablePresentation().presentationSubmission.definition_id = pd.id;
    const result = info.find((result) => result.verifiable_credential_path === `$.${path}[${vc[0]}]`);
    if (!result) {
      return;
    }
    if (!this.getVerifiablePresentation()[`${path}`]) {
      this.getVerifiablePresentation()[`${path}`] = [];
    }
    this.addInputDescriptorToResults(pd.input_descriptors, vc, result, path);
  }

  private addInputDescriptorToResults(
    inputDescriptors: InputDescriptor[],
    vc: [number, any],
    info: HandlerCheckResult,
    path: string
  ) {
    for (const id of inputDescriptors.entries()) {
      if (info.input_descriptor_path === `$.input_descriptors[${id[0]}]`) {
        const descriptor: Descriptor = { id: id[1].id, format: 'ldp_vc', path: `$.${path}[${vc[0]}]` };
        this.pushToDescriptorsMap(descriptor, vc, path);
        this.pushToResults(info, id);
      }
    }
  }

  private pushToResults(r: HandlerCheckResult, id: [number, InputDescriptor]) {
    this.getResults().push({
      input_descriptor_path: r.input_descriptor_path,
      verifiable_credential_path: r.verifiable_credential_path,
      evaluator: this.getName(),
      status: Status.INFO,
      payload: { group: id[1].group },
      message: 'The input candidate is eligible for submission',
    });
  }

  private pushToDescriptorsMap(newDescriptor: Descriptor, vc: [number, unknown], path: string) {
    const descriptorMap: Descriptor[] = this.getVerifiablePresentation().presentationSubmission.descriptor_map;
    if (descriptorMap.find((d) => d.id === newDescriptor.id && d.path !== newDescriptor.path)) {
      this.getVerifiablePresentation()[`${path}`].push(vc[1]);
      this.getVerifiablePresentation().presentationSubmission.descriptor_map.forEach((d: Descriptor) =>
        this.addPathNestedDescriptor(d, newDescriptor)
      );
    } else if (
      !descriptorMap.find(
        (d) => d.id === newDescriptor.id && d.format === newDescriptor.format && d.path === newDescriptor.path
      )
    ) {
      this.getVerifiablePresentation()[`${path}`].push(vc[1]);
      this.getVerifiablePresentation().presentationSubmission.descriptor_map.push(newDescriptor);
    }
  }

  private addPathNestedDescriptor(descriptor: Descriptor, nestedDescriptor: Descriptor): Descriptor {
    if (descriptor.path_nested) {
      this.addPathNestedDescriptor(descriptor.path_nested, nestedDescriptor);
    } else {
      descriptor.path_nested = nestedDescriptor;
    }
    return descriptor;
  }
}
