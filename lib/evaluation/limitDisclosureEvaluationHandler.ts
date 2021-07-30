import { Constraints, Field, Optionality, PresentationDefinition } from '@sphereon/pe-models';

import { Status } from '../ConstraintUtils';
import { JsonPathUtils } from '../utils/jsonPathUtils';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { EvaluationClient } from './evaluationClient';

export class LimitDisclosureEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'LimitDisclosureEvaluation';
  }

  //TODO: what is the necessary field? "@context", "credentialSchema", "credentialSubject", "type"
  static mandatoryFields: string[] = ['@context', 'credentialSchema', 'credentialSubject', 'type'];

  public handle(pd: PresentationDefinition, p: unknown): void {
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      const constraints: Constraints = pd.input_descriptors[i].constraints;
      //TODO: write the impl for "limitDisclosureShouldBeEnforced" as well. Should it generate WARNING?
      if (constraints && constraints.limit_disclosure && constraints.limit_disclosure === Optionality.Required) {
        this.limitDisclosureShouldBeEnforced(p, constraints.fields, i);
      }
    }
  }

  private limitDisclosureShouldBeEnforced(
    verifiablePresentation: any,
    fields: Field[],
    inputDescriptorIdx: number
  ): void {
    for (let i = 0; i < verifiablePresentation.verifiableCredential.length; i++) {
      const verifiableCredentialToSend = {};
      let keys = Object.keys(verifiablePresentation.verifiableCredential[i]);
      keys = this.copyMandatoryFieldsAndDeletePredefinedKeys(
        verifiablePresentation.verifiableCredential[i],
        verifiableCredentialToSend,
        keys
      );
      this.determineNecessaryPaths(
        verifiablePresentation.verifiableCredential[i],
        verifiableCredentialToSend,
        keys,
        fields,
        inputDescriptorIdx,
        i
      );
      this.copyModifiedVerifiableCredentialToExisting(verifiableCredentialToSend);
    }
  }

  private copyMandatoryFieldsAndDeletePredefinedKeys(
    verifiableCredential: unknown,
    verifiableCredentialToSend: unknown,
    keys: string[]
  ): string[] {
    for (let i = 0; i < LimitDisclosureEvaluationHandler.mandatoryFields.length; i++) {
      verifiableCredentialToSend[LimitDisclosureEvaluationHandler.mandatoryFields[i]] =
        verifiableCredential[LimitDisclosureEvaluationHandler.mandatoryFields[i]];
      const index = keys.indexOf(LimitDisclosureEvaluationHandler.mandatoryFields[i]);
      if (index > -1) {
        keys.splice(index, 1);
      }
    }
    return keys;
  }

  private determineNecessaryPaths(
    vc: unknown,
    vcToSend: unknown,
    _keys: string[],
    fields: Field[],
    idIdx: number,
    vcIdx: number
  ) {
    for (let i = 0; i < fields.length; i++) {
      const field: Field = fields[i];
      const result = JsonPathUtils.extractInputField(vc, field.path);
      if (result.length > 0) {
        //TODO: do we need to consider other paths here?
        this.copyResultPathToDestinationCredential(result[0].path, vc, vcToSend, idIdx, vcIdx);
      } else {
        this.createMandatoryFieldNotFoundResult(idIdx, vcIdx, field.path);
      }
    }
  }

  private createMandatoryFieldNotFoundResult(idIdx: number, vcIdx: number, path: Array<string>) {
    return this.results.push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$.verifiableCredential[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: 'mandatory field not present in the verifiableCredential',
      payload: path,
    });
  }

  private copyResultPathToDestinationCredential(
    pathDetails: any[],
    verifiableCredential: unknown,
    verifiableCredentialToSend: unknown,
    _idIdx: number,
    _vcIdx: number
  ) {
    let objectCursor = verifiableCredential;
    let currentCursorInToSendObj = verifiableCredentialToSend;
    for (let i = 1; i < pathDetails.length; i++) {
      objectCursor = objectCursor[pathDetails[i]];
      if (pathDetails.length == i + 1) {
        currentCursorInToSendObj[pathDetails[i]] = objectCursor;
      } else if (typeof pathDetails[i] === 'string' && typeof pathDetails[i + 1] === 'string') {
        currentCursorInToSendObj[pathDetails[i]] = {};
        currentCursorInToSendObj = currentCursorInToSendObj[pathDetails[i]];
      } else if (typeof pathDetails[i] === 'string' && typeof pathDetails[i + 1] !== 'string') {
        currentCursorInToSendObj[pathDetails[i]] = [{}];
        currentCursorInToSendObj = currentCursorInToSendObj[pathDetails[i]];
      } else {
        currentCursorInToSendObj[pathDetails[i]] = {};
        currentCursorInToSendObj = currentCursorInToSendObj[pathDetails[i]];
      }
    }
  }

  //TODO: change it according to Maikel's changes
  private copyModifiedVerifiableCredentialToExisting(verifiableCredentialToSend: any) {
    if (this.verifiablePresentation.verifiableCredential) {
      for (let i = 0; i < this.verifiablePresentation.verifiableCredential.length; i++) {
        if (this.verifiablePresentation.verifiableCredential[i].id === verifiableCredentialToSend.id) {
          this.verifiablePresentation.verifiableCredential[i] = { ...verifiableCredentialToSend };
        }
      }
    } else {
      this.verifiablePresentation.verifiableCredential = [];
      this.verifiablePresentation.verifiableCredential.push(verifiableCredentialToSend);
    }
  }
}
