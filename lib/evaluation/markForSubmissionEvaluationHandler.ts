import { Descriptor, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import { nanoid } from 'nanoid';

import { Status } from '../ConstraintUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { EvaluationClient } from './evaluationClient';
import { HandlerCheckResult } from './handlerCheckResult';

export class MarkForSubmissionEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
    this.verifiablePresentation.presentationSubmission = {};
    this.verifiablePresentation.presentationSubmission.descriptor_map = [];
    this.verifiablePresentation.presentationSubmission.id = nanoid();
  }

  public getName(): string {
    return 'MarkForSubmissionEvaluation';
  }

  public handle(pd: PresentationDefinition, p: unknown): void {
    this.iterateOverInputCandidates(pd, p);
  }

  //TODO move to utils
  private iterateOverInputCandidates(pd: PresentationDefinition, inputCandidates: unknown): void {
    const verifiableCredentials = Object.entries(inputCandidates).filter(
      (x) => Array.isArray(x[1]) && x[1].length && typeof x[1][0] === 'object'
    ) as Array<[string, Array<unknown>]>;
    for (const [key, value] of verifiableCredentials) {
      for (const vc of value.entries()) {
        this.iterateOverInputDescriptors(pd, vc, key);
      }
    }
  }

  private iterateOverInputDescriptors(pd: PresentationDefinition, vc: [number, unknown], path: string): void {
    const error = this.getResults().find(
      (result) => result.status === Status.ERROR && result.verifiable_credential_path === `$.${path}[${vc[0]}]`
    );
    if (error) {
      const payload = { ...error.payload };
      payload.evaluator = error.evaluator;
      this.getResults().push({
        ...error,
        evaluator: this.getName(),
        message: 'The input candidate is not eligible for submission',
        payload: payload
      });
    } else {
      this.createPresentationSubmission(pd, vc, path);
    }
  }

  private createPresentationSubmission(pd: PresentationDefinition, vc: any, path: string) {
    const verifiablePresentation = this.verifiablePresentation;
    verifiablePresentation.presentationSubmission.definition_id = pd.id;
    const info = this.getResults().filter((result) => result.verifiable_credential_path === `$.${path}[${vc[0]}]`);
    if (!verifiablePresentation[`${path}`]) {
      verifiablePresentation[`${path}`] = [];
    }
    this.addInputDescriptorToResults(pd.input_descriptors, vc, info, path);
  }

  private addInputDescriptorToResults(
    inputDescriptors: InputDescriptor[],
    vc: [number, any],
    info: HandlerCheckResult[],
    path: string
  ) {
    for (const id of inputDescriptors.entries()) {
      for (const r of info) {
        if (r.input_descriptor_path === `$.input_descriptors[${id[0]}]`) {
          const descriptor: Descriptor = { id: id[1].id, format: 'ldp_vc', path: r.verifiable_credential_path };
          this.pushToDescriptorsMap(descriptor, vc, path);
          this.pushToResults(r, id);
        }
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
    const verifiablePresentation = this.verifiablePresentation;
    const descriptorMap: Descriptor[] = verifiablePresentation.presentationSubmission.descriptor_map;
    if (descriptorMap.find((d) => d.id === newDescriptor.id && d.path !== newDescriptor.path)) {
      verifiablePresentation[`${path}`].push(vc[1]);
      verifiablePresentation.presentationSubmission.descriptor_map.forEach((d: Descriptor) =>
        this.addPathNestedDescriptor(d, newDescriptor)
      );
    } else if (
      !descriptorMap.find(
        (d) => d.id === newDescriptor.id && d.format === newDescriptor.format && d.path === newDescriptor.path
      )
    ) {
      verifiablePresentation[`${path}`].push(vc[1]);
      verifiablePresentation.presentationSubmission.descriptor_map.push(newDescriptor);
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
