import { Descriptor, Field, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import jp from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { JsonPathUtils } from '../../utils/jsonPathUtils';
import { VerifiableCredential, VerifiablePresentation } from '../../verifiablePresentation';
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

  public handle(pd: PresentationDefinition, p: VerifiablePresentation): void {
    pd.input_descriptors.forEach((inDesc: InputDescriptor, index: number) => {
      if (
        inDesc.constraints &&
        inDesc.constraints.limit_disclosure &&
        inDesc.constraints.fields &&
        inDesc.constraints.limit_disclosure === Optionality.Required
      ) {
        this.limitDisclosureShouldBeEnforced(p, inDesc.constraints.fields, index, inDesc.id);
      }
    });
  }

  private limitDisclosureShouldBeEnforced(
    verifiablePresentation: VerifiablePresentation,
    fields: Field[],
    idIdx: number,
    inputDescriptorId: string
  ): void {
    for (let i = 0; i < verifiablePresentation.verifiableCredential.length; i++) {
      const verifiableCredentialToSend: VerifiableCredential = this.createWithMandatoryFields(
        verifiablePresentation.verifiableCredential[i]
      );
      this.determineNecessaryPaths(
        verifiablePresentation.verifiableCredential[i],
        verifiableCredentialToSend,
        fields,
        idIdx,
        i
      );
      if (
        this.verifiablePresentation.presentation_submission &&
        this.verifiablePresentation.presentation_submission.descriptor_map
      ) {
        this.copyModifiedVerifiableCredentialToExisting(verifiableCredentialToSend, inputDescriptorId);
      }
    }
  }

  private createWithMandatoryFields(verifiableCredential: VerifiableCredential): VerifiableCredential {
    const verifiableCredentialToSend: VerifiableCredential = {
      '@context': verifiableCredential['@context'],
      issuer: verifiableCredential.issuer,
      issuanceDate: verifiableCredential.issuanceDate,
      proof: verifiableCredential.proof,
      id: verifiableCredential.id,
      credentialSubject: verifiableCredential.credentialSubject,
      type: verifiableCredential.type,
    };
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
    let objectCursor: any = verifiableCredential;
    let currentCursorInToSendObj: any = verifiableCredentialToSend;
    for (let i = 1; i < pathDetails.length; i++) {
      objectCursor = objectCursor[pathDetails[i]];
      if (pathDetails.length == i + 1) {
        currentCursorInToSendObj[pathDetails[i]] = objectCursor;
      } else if (typeof pathDetails[i] === 'string' && typeof pathDetails[i + 1] !== 'string') {
        currentCursorInToSendObj = [{}];
      } else {
        currentCursorInToSendObj = {};
      }
    }
  }

  private copyModifiedVerifiableCredentialToExisting(
    verifiableCredentialToSend: VerifiableCredential,
    inputDescriptorId: string
  ) {
    const verifiablePresentation = this.verifiablePresentation;
    for (let i = 0; i < verifiablePresentation.presentation_submission.descriptor_map.length; i++) {
      const currentDescriptor: Descriptor = verifiablePresentation.presentation_submission.descriptor_map[i];
      if (currentDescriptor.id === inputDescriptorId) {
        this.updateVcForPath(verifiableCredentialToSend, currentDescriptor.path, i);
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
    jp.apply(this.verifiablePresentation, path, (value: VerifiableCredential) => {
      value = verifiableCredentialToSend;
      return value;
    });
  }
}
