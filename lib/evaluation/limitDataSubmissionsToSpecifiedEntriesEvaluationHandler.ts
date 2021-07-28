import {Constraints, Field, Optionality, PresentationDefinition} from '@sphereon/pe-models';

import {AbstractEvaluationHandler} from './abstractEvaluationHandler';
import {JsonPathUtils} from "../utils/jsonPathUtils";
import {Status} from "../ConstraintUtils";

export class LimitDataSubmissionsToSpecifiedEntriesEvaluationHandler extends AbstractEvaluationHandler {

  //TODO: what is the necessary field? "@context", "credentialSchema", "credentialSubject", "type"
  static mandatoryFields: string[] = ["@context", "credentialSchema", "credentialSubject", "type"];

  public getName(): string {
    return 'LimitDataSubmissions';
  }

  public handle(pd: PresentationDefinition, p: unknown): void {
    // HERE we process the predicate part of the PD
    for (let i = 0; i < pd.input_descriptors.length; i++) {
      const constraints: Constraints = pd.input_descriptors[i].constraints;
      //TODO: write the impl for "limitDisclosureShouldBeEnforced" as well. Should it generate WARNING?
      if (constraints && constraints.limit_disclosure) {
        this.limitDisclosureShouldBeEnforced(p, constraints.fields, i, constraints.limit_disclosure);
      }
    }
  }

  private limitDisclosureShouldBeEnforced(
    verifiablePresentation: any,
    fields: Field[],
    inputDescriptorIdx: number,
    enforcingPolicy: Optionality
  ): void {
    for (let i = 0; i < verifiablePresentation.verifiableCredential.length; i++) {
      const verifiableCredentialToSend = {};
      let keys = Object.keys(verifiablePresentation.verifiableCredential[i]);
      keys = this.copyMandatoryFieldsAndDeletePredefinedKeys(verifiablePresentation.verifiableCredential[i], verifiableCredentialToSend, keys);
      this.determineNecessaryPaths(verifiablePresentation.verifiableCredential[i], verifiableCredentialToSend, keys, fields, inputDescriptorIdx, i, enforcingPolicy);
      this.presentationSubmission = 
    }
  }

  private copyMandatoryFieldsAndDeletePredefinedKeys(verifiableCredential: any, verifiableCredentialToSend: any, keys: string[]): string[] {
    for (let i = 0; i < LimitDataSubmissionsToSpecifiedEntriesEvaluationHandler.mandatoryFields.length; i++) {
      verifiableCredentialToSend[LimitDataSubmissionsToSpecifiedEntriesEvaluationHandler.mandatoryFields[i]] = verifiableCredential[LimitDataSubmissionsToSpecifiedEntriesEvaluationHandler.mandatoryFields[i]];
      const index = keys.indexOf(LimitDataSubmissionsToSpecifiedEntriesEvaluationHandler.mandatoryFields[i]);
      if (index > -1) {
        keys.splice(index, 1);
      }
    }
    return keys;
  }

  private determineNecessaryPaths(
    vc: any,
    vcToSend: any,
    _keys: string[],
    fields: Field[],
    idIdx: number,
    vcIdx: number,
    enforcingPolicy: Optionality) {

    for (let i = 0; i < fields.length; i++) {
      const field: Field = fields[i];
      let result = JsonPathUtils.extractInputField(vc, field.path);
      console.log(result);
      if (result.length > 0) {
        //TODO: do we need to consider other paths here?
        this.copyResultPathToDestinationCredential(result[0].path, vc, vcToSend, idIdx, vcIdx, enforcingPolicy);
      } else {
        this.createMandatoryFieldNotFoundResult(idIdx, vcIdx, field.path);
      }
    }
  }

  private createMandatoryFieldNotFoundResult(inputDescriptorIdx: number, verifiableCredentialIdx: number, path: Array<string>) {
    return this.results.push({
      input_descriptor_path: `$.input_descriptors[${inputDescriptorIdx}]`,
      verifiable_credential_path: `$.verifiableCredential[${verifiableCredentialIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: 'mandatory field not present in the verifiableCredential',
      payload: path
    });
  }

  private copyResultPathToDestinationCredential(
    pathDetails: any[],
    verifiableCredential: any,
    verifiableCredentialToSend: any,
    _idIdx: number,
    _vcIdx: number,
    _enforcingPolicy: Optionality) {
    let objectCursor = verifiableCredential;
    let currentCursorInToSendObj = verifiableCredentialToSend;
    for (let i = 1; i < pathDetails.length; i++) {
      objectCursor = objectCursor[pathDetails[i]];
      if (pathDetails.length==i+1) {
        currentCursorInToSendObj[pathDetails[i]] = objectCursor;
      }
      else if (typeof pathDetails[i]==="string" && typeof pathDetails[i+1]==="string") {
        currentCursorInToSendObj[pathDetails[i]] = {}
        currentCursorInToSendObj = currentCursorInToSendObj[pathDetails[i]];
      } else if (typeof pathDetails[i]==="string" && typeof pathDetails[i+1]!=="string"){
        currentCursorInToSendObj[pathDetails[i]] = [{}];
        currentCursorInToSendObj = currentCursorInToSendObj[pathDetails[i]];
      }
      else{
        currentCursorInToSendObj[pathDetails[i]] = {}
        currentCursorInToSendObj = currentCursorInToSendObj[pathDetails[i]];
      }
    }
    currentCursorInToSendObj = objectCursor;
    console.log("verifiableCredentialToSend:", verifiableCredentialToSend)
    console.log("currentCursorInToSendObj:", currentCursorInToSendObj)
  }
}