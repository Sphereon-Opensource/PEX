import { Descriptor, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import { nanoid } from 'nanoid';

import { Status } from '../ConstraintUtils';
import { VerifiableCredential, VerifiablePresentation, VP } from '../verifiablePresentation';
import { Presentation } from '../verifiablePresentation/models';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { EvaluationClient } from './evaluationClient';
import { HandlerCheckResult } from './handlerCheckResult';

export class MarkForSubmissionEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'MarkForSubmissionEvaluation';
  }

  public handle(pd: PresentationDefinition, p: VerifiablePresentation): void {
    this.verifiablePresentation = new VP(
      new Presentation(
        null,
        {
          id: nanoid(),
          definition_id: pd.id,
          descriptor_map: [],
        },
        null,
        [],
        null
      )
    );
    this.createVerifiableCredentialsArrays(pd, p);
  }

  private createVerifiableCredentialsArrays(
    pd: PresentationDefinition,
    verifiablePresentation: VerifiablePresentation
  ): void {
    const verifiableCredentials = this.extractVerifiableCredentials(verifiablePresentation);
    for (const [key, value] of verifiableCredentials) {
      for (const vc of value.entries()) {
        this.iterateOverInputDescriptors(pd, vc, key);
      }
    }
  }

  private extractVerifiableCredentials(verifiablePresentation: VerifiablePresentation) {
    return Object.entries(verifiablePresentation.getRoot()).filter(
      (x) => Array.isArray(x[1]) && x[1].length && typeof x[1][0] === 'object'
    ) as Array<[string, Array<unknown>]>;
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
        payload: payload,
      });
    } else {
      this.createPresentationSubmission(pd, vc, path);
    }
  }

  private createPresentationSubmission(pd: PresentationDefinition, vc: any, path: string) {
    this.verifiablePresentation.getPresentationSubmission().definition_id = pd.id;
    const info = this.getResults().find((result) => result.verifiable_credential_path === `$.${path}[${vc[0]}]`);
    if (!info) {
      return;
    }
    if (!this.verifiablePresentation[`${path}`]) {
      this.verifiablePresentation[`${path}`] = [];
    }
    this.addInputDescriptorToResults(pd.input_descriptors, vc, info, path);
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

  private pushToDescriptorsMap(newDescriptor: Descriptor, vc: [number, VerifiableCredential], path: string) {
    const descriptorMap: Descriptor[] = this.verifiablePresentation.getPresentationSubmission().descriptor_map;
    if (descriptorMap.find((d) => d.id === newDescriptor.id && d.path !== newDescriptor.path)) {
      this.verifiablePresentation.getRoot()[`${path}`].push(vc[1]);
      this.verifiablePresentation
        .getPresentationSubmission()
        .descriptor_map.forEach((d: Descriptor) => this.addPathNestedDescriptor(d, newDescriptor));
    } else if (
      !descriptorMap.find(
        (d) => d.id === newDescriptor.id && d.format === newDescriptor.format && d.path === newDescriptor.path
      )
    ) {
      if (this.verifiablePresentation.getRoot()[`${path}`]) {
        this.verifiablePresentation.getRoot()[`${path}`].push(vc[1]);
        this.verifiablePresentation.getPresentationSubmission().descriptor_map.push(newDescriptor);
      }
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
