import { Descriptor, Field, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import jp from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { JsonPathUtils } from '../../utils/jsonPathUtils';
import { VerifiableCredential } from '../../verifiablePresentation';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class LimitDisclosureEvaluationHandler extends AbstractEvaluationHandler {
  static mandatoryFields: string[] = ['@context', 'credentialSchema'];

  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'LimitDisclosureEvaluation';
  }

  public handle(pd: PresentationDefinition, vcs: VerifiableCredential[]): void {
    pd.input_descriptors.forEach((inDesc: InputDescriptor, index: number) => {
      if (inDesc.constraints?.fields && inDesc.constraints?.limit_disclosure === Optionality.Required) {
        this.limitDisclosureShouldBeEnforced(vcs, inDesc.constraints.fields, index, inDesc.id);
      }
    });

    if (this.getResults().filter((r) => r.evaluator === 'LimitDisclosureEvaluation').length) {
      this.presentationSubmission.descriptor_map = this.getResults()
        .filter((r) => r.status === Status.ERROR && r.evaluator === 'LimitDisclosureEvaluation')
        .flatMap((r) => {
          /**
           * TODO Map nested credentials
           */
          const inputDescriptor: InputDescriptor = jp.query(pd, r.input_descriptor_path)[0];
          return this.presentationSubmission.descriptor_map.filter(
            (ps) => ps.path !== r.verifiable_credential_path && ps.id !== inputDescriptor.id
          );
        });
    }
  }

  private limitDisclosureShouldBeEnforced(
    verifiableCredential: VerifiableCredential[],
    fields: Field[],
    idIdx: number,
    inputDescriptorId: string
  ): void {
    for (let i = 0; i < verifiableCredential.length; i++) {
      const verifiableCredentialToSend: VerifiableCredential = this.createWithMandatoryFields(verifiableCredential[i]);
      this.determineNecessaryPaths(verifiableCredential[i], verifiableCredentialToSend, fields, idIdx, i);
      if (this.client.presentationSubmission.descriptor_map) {
        this.copyModifiedVerifiableCredentialToExisting(verifiableCredentialToSend, inputDescriptorId);
      }
    }
  }

  private createWithMandatoryFields(verifiableCredential: VerifiableCredential): VerifiableCredential {
    const verifiableCredentialToSend: VerifiableCredential = { ...verifiableCredential };
    for (let i = 0; i < LimitDisclosureEvaluationHandler.mandatoryFields.length; i++) {
      verifiableCredentialToSend[LimitDisclosureEvaluationHandler.mandatoryFields[i]] =
        verifiableCredential[LimitDisclosureEvaluationHandler.mandatoryFields[i]];
    }
    return verifiableCredentialToSend;
  }

  private determineNecessaryPaths(
    vc: VerifiableCredential,
    vcToSend: VerifiableCredential,
    fields: Field[],
    idIdx: number,
    vcIdx: number
  ): void {
    for (let i = 0; i < fields.length; i++) {
      const field: Field = fields[i];
      if (field && field.path) {
        const inputField = JsonPathUtils.extractInputField(vc, field.path);
        if (inputField.length > 0) {
          this.copyResultPathToDestinationCredential(inputField[0].path, vc, vcToSend);
        } else {
          this.createMandatoryFieldNotFoundResult(idIdx, vcIdx, field.path);
        }
      }
    }
  }

  private copyResultPathToDestinationCredential(
    pathDetails: (string | number)[],
    verifiableCredential: VerifiableCredential,
    verifiableCredentialToSend: VerifiableCredential
  ): void {
    let objectCursor: { [x: string]: unknown } = { ...verifiableCredential };
    let currentCursorInToSendObj: { [x: string]: unknown } = { ...verifiableCredentialToSend };
    for (let i = 1; i < pathDetails.length; i++) {
      objectCursor = objectCursor[pathDetails[i]] as { [x: string]: unknown };
      if (pathDetails.length == i + 1) {
        currentCursorInToSendObj[pathDetails[i]] = objectCursor;
      } else if (typeof pathDetails[i] === 'string' && typeof pathDetails[i + 1] !== 'string') {
        currentCursorInToSendObj = Object.assign(currentCursorInToSendObj, [{}]);
      } else {
        currentCursorInToSendObj = {};
      }
    }
  }

  private copyModifiedVerifiableCredentialToExisting(
    verifiableCredentialToSend: VerifiableCredential,
    inputDescriptorId: string
  ) {
    if (this.client.presentationSubmission.descriptor_map.length) {
      for (let i = 0; i < this.client.presentationSubmission.descriptor_map.length; i++) {
        const currentDescriptor: Descriptor = this.client.presentationSubmission.descriptor_map[i];
        if (currentDescriptor.id === inputDescriptorId) {
          this.updateVcForPath(verifiableCredentialToSend, currentDescriptor.path, i);
        }
      }
    }
  }

  private createSuccessResult(idIdx: number, path: string) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `${path}`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: 'added variable in the limit_disclosure to the verifiableCredential',
      payload: undefined,
    });
  }

  private createMandatoryFieldNotFoundResult(idIdx: number, vcIdx: number, path: Array<string>) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$.verifiableCredential[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: 'mandatory field not present in the verifiableCredential',
      payload: path,
    });
  }

  /**
   * updates existing VC in the verifiablePresentation object with the new one, that is generated with limit_disclosure
   * @param verifiableCredentialToSend: the VC object created with limit_disclosure constraints
   * @param path example: "$.verifiableCredential[0]"
   * @param idIdx
   */
  private updateVcForPath(verifiableCredentialToSend: VerifiableCredential, path: string, idIdx: number): void {
    this.createSuccessResult(idIdx, path);
    jp.apply(this.client, path, (value: VerifiableCredential) => {
      value = verifiableCredentialToSend;
      return value;
    });
  }
}
