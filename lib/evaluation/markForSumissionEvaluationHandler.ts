import { Descriptor, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import { nanoid } from 'nanoid';

import { Status } from '../ConstraintUtils';

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

  public handle(pd: PresentationDefinition, p: any): void {
    const inputDescriptors: InputDescriptor[] = pd.input_descriptors;
    for (const vc of p.verifiableCredential.entries()) {
      const error = this.results.find(
        (result) =>
          result.status === Status.ERROR && result.verifiable_credential_path === `$.verifiableCredential[${vc[0]}]`
      );
      if (error) {
        this.results.push({
          ...error,
          message: 'The input candidate is not eligible for submission',
        });
      } else {
        this.createPresentationSubmission(pd, vc, inputDescriptors);
      }
    }
  }

  private createPresentationSubmission(pd: PresentationDefinition, vc: any, inputDescriptors: InputDescriptor[]) {
    this.presentationSubmission.id = nanoid();
    this.presentationSubmission.definition_id = pd.id;
    const info = this.results.filter(
      (result) => result.verifiable_credential_path === `$.verifiableCredential[${vc[0]}]`
    );
    this.handleInputDescriptors(inputDescriptors, info);
  }

  private handleInputDescriptors(inputDescriptors: InputDescriptor[], info: HandlerCheckResult[]) {
    for (const id of inputDescriptors.entries()) {
      for (const r of info) {
        if (r.input_descriptor_path === `$.input_descriptors[${id[0]}]`) {
          const descriptor: Descriptor = { id: id[1].id, format: 'ldp_vc', path: r.verifiable_credential_path };
          this.pushToDescriptorsMap(descriptor);
          this.pushToResults(r, id);
        }
      }
    }
  }

  private pushToResults(r: HandlerCheckResult, id: [number, InputDescriptor]) {
    this.results.push({
      input_descriptor_path: r.input_descriptor_path,
      verifiable_credential_path: r.verifiable_credential_path,
      evaluator: this.getName(),
      status: Status.INFO,
      payload: { group: id[1].group },
      message: 'The input candidate is eligible for submission',
    });
  }

  private pushToDescriptorsMap(descriptor: Descriptor) {
    if (
      !this.presentationSubmission.descriptor_map.find(
        (d) => d.id === descriptor.id && d.path === descriptor.path && d.format === descriptor.format
      )
    ) {
      this.presentationSubmission.descriptor_map.push(descriptor);
    }
  }
}
