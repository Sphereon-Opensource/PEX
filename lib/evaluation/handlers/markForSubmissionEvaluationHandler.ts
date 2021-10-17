import { Descriptor, InputDescriptor, PresentationDefinition } from '@sphereon/pe-models';
import { nanoid } from 'nanoid';

import { Status } from '../../ConstraintUtils';
import { VerifiableCredential, VerifiablePresentation } from '../../verifiablePresentation';
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

  public handle(pd: PresentationDefinition, p: VerifiablePresentation): void {
    this.verifiablePresentation = {
      '@context': [],
      type: '',
      presentation_submission: {
        id: nanoid(),
        definition_id: pd.id,
        descriptor_map: [],
      },
      holder: p.holder,
      verifiableCredential: [],
      proof: {
        created: '',
        verificationMethod: '',
        type: '',
        proofPurpose: '',
        jws: '',
      },
    };
    const results: HandlerCheckResult[] = [...this.getResults()];
    const errors: HandlerCheckResult[] = this.removeDuplicate(
      results.filter((result: HandlerCheckResult) => result.status === Status.ERROR)
    );
    const info: HandlerCheckResult[] = this.removeDuplicate(
      results.filter(
        (result: HandlerCheckResult) =>
          result.status === Status.INFO &&
          !errors.find(
            (e) =>
              e.input_descriptor_path === result.input_descriptor_path &&
              e.verifiable_credential_path === result.verifiable_credential_path
          )
      )
    );
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

  private extractVerifiableCredentials(inputCandidates: VerifiablePresentation) {
    return Object.entries(inputCandidates).filter(
      (x) => Array.isArray(x[1]) && x[1].length && typeof x[1][0] === 'object'
    ) as Array<[string, Array<VerifiableCredential>]>;
  }

  private createPresentationSubmission(
    pd: PresentationDefinition,
    vc: [number, VerifiableCredential],
    info: HandlerCheckResult[],
    path: string
  ) {
    this.verifiablePresentation.presentation_submission.definition_id = pd.id;
    const result = info.find((result) => result.verifiable_credential_path === `$.${path}[${vc[0]}]`);
    if (!result) {
      return;
    }
    this.addInputDescriptorToResults(pd.input_descriptors, vc, result, path);
  }

  private addInputDescriptorToResults(
    inputDescriptors: InputDescriptor[],
    vc: [number, VerifiableCredential],
    info: HandlerCheckResult,
    path: string
  ) {
    for (const id of inputDescriptors.entries()) {
      if (info.input_descriptor_path === `$.input_descriptors[${id[0]}]`) {
        const descriptor: Descriptor = { id: id[1].id, format: 'ldp_vc', path: `$.${path}[${vc[0]}]` };
        this.pushToDescriptorsMap(descriptor, vc);
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

  private pushToDescriptorsMap(newDescriptor: Descriptor, vc: [number, VerifiableCredential]) {
    const descriptorMap: Descriptor[] = this.verifiablePresentation.presentation_submission.descriptor_map;
    if (descriptorMap.find((d) => d.id === newDescriptor.id && d.path !== newDescriptor.path)) {
      this.verifiablePresentation.verifiableCredential.push(vc[1]);
      this.verifiablePresentation.presentation_submission.descriptor_map.forEach((d: Descriptor) =>
        this.addPathNestedDescriptor(d, newDescriptor)
      );
    } else if (
      !descriptorMap.find(
        (d) => d.id === newDescriptor.id && d.format === newDescriptor.format && d.path === newDescriptor.path
      )
    ) {
      this.verifiablePresentation.verifiableCredential.push(vc[1]);
      this.verifiablePresentation.presentation_submission.descriptor_map.push(newDescriptor);
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
