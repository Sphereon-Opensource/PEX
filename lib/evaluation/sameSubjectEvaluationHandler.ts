import { Descriptor, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import jp from 'jsonpath';

import { Status } from '../ConstraintUtils';
import { VerifiablePresentation } from '../verifiablePresentation';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { EvaluationClient } from './evaluationClient';
import { HandlerCheckResult } from './handlerCheckResult';

export class SameSubjectEvaluationHandler extends AbstractEvaluationHandler {
  private readonly fieldIdzInputDescriptorsSameSubjectRequired: Map<Set<string>, Set<string>>;
  private readonly fieldIdzInputDescriptorsSameSubjectPreferred: Map<Set<string>, Set<string>>;
  private readonly allDescribedCredentialsPaths: Map<string, string>;

  private credentialsSubjects: Map<string, string>;

  private messages: Map<Status, string>;

  constructor(client: EvaluationClient) {
    super(client);

    this.fieldIdzInputDescriptorsSameSubjectRequired = new Map<Set<string>, Set<string>>();
    this.fieldIdzInputDescriptorsSameSubjectPreferred = new Map<Set<string>, Set<string>>();
    this.allDescribedCredentialsPaths = new Map<string, string>();

    this.credentialsSubjects = new Map<string, string>();

    this.messages = new Map<Status, string>();
    this.messages.set(Status.INFO, 'The field ids requiring the same subject belong to same subject');
    this.messages.set(Status.WARN, 'The field ids preferring the same subject do not belong to same subject');
    this.messages.set(Status.ERROR, 'The field ids requiring the same subject do not belong to same subject');
  }

  public getName(): string {
    return 'SameSubjectEvaluationHandler';
  }

  public handle(pd: PresentationDefinition, vp: VerifiablePresentation): void {
    this.getSameSubjectFieldIdsToInputDescriptorsSets(pd);
    this.getAllDescribedCredentialsPaths(vp);
    this.getAllCredentialSubjects(this.allDescribedCredentialsPaths, vp);

    this.confirmAllFieldSetHasSameSubject(this.fieldIdzInputDescriptorsSameSubjectRequired, Status.ERROR);
    this.confirmAllFieldSetHasSameSubject(this.fieldIdzInputDescriptorsSameSubjectPreferred, Status.WARN);
  }

  /**
   * We have input descriptor to field ids mapping. This function gets a (reverse) map from field id to input descriptor
   */
  private getSameSubjectFieldIdsToInputDescriptorsSets(pd: PresentationDefinition) {
    pd.input_descriptors.forEach(this.mapFieldIdsToInputDescriptors());
  }

  private mapFieldIdsToInputDescriptors() {
    return (inputDescriptor) => {
      inputDescriptor.constraints.same_subject.forEach(this.mapSameSubjectsToInputDescriptors(inputDescriptor));
    };
  }

  private mapSameSubjectsToInputDescriptors(inDesc: InputDescriptor) {
    return (sameSubjectGroup) => {
      let fieldIdzInputDescriptors;

      if (sameSubjectGroup.directive === Optionality.Required) {
        fieldIdzInputDescriptors = this.fieldIdzInputDescriptorsSameSubjectRequired;
      } else if (sameSubjectGroup.directive === Optionality.Preferred) {
        fieldIdzInputDescriptors = this.fieldIdzInputDescriptorsSameSubjectPreferred;
      }

      sameSubjectGroup.field_id.forEach(this.upsertFieldIdToInputDescriptorMapping(fieldIdzInputDescriptors, inDesc));
    };
  }

  /**
   * Update or insert the value in the map.
   *
   * @param fieldIdzInputDescriptors the map in which the value will be upserted.
   * @param inDesc the input descriptor which is being mapped by the fieldId
   *
   * @private
   */
  private upsertFieldIdToInputDescriptorMapping(
    fieldIdzInputDescriptors: Map<Set<string>, Set<string>>,
    inDesc: InputDescriptor
  ) {
    return (fieldId) => {
      if (!this.getValue(fieldIdzInputDescriptors, fieldId)) {
        SameSubjectEvaluationHandler.addEntry(fieldIdzInputDescriptors, fieldId, inDesc.id);
      } else {
        this.getValue(fieldIdzInputDescriptors, fieldId).add(inDesc.id);
      }
    };
  }

  getValue(fieldIdzInputDescriptors: Map<Set<string>, Set<string>>, fieldId: string): Set<string> {
    let value: Set<string> = new Set<string>();
    fieldIdzInputDescriptors.forEach((fieldIds: Set<string>, inputDescriptorIds: Set<string>) => {
      value = this.getValueWithOneOfTheKeys(fieldIds, inputDescriptorIds, fieldId);
    });

    return value;
  }

  private getValueWithOneOfTheKeys(
    fieldIds: Set<string>,
    inputDescriptorIds: Set<string>,
    fieldId: string
  ): Set<string> {
    let value: Set<string> = new Set<string>();

    fieldIds.forEach((fieldIdKey) => {
      value = SameSubjectEvaluationHandler.getValueForKey(fieldIdKey, fieldId, inputDescriptorIds);
    });

    return value;
  }

  private static getValueForKey(fieldIdKey: string, fieldId: string, inputDescriptorIds: Set<string>): Set<string> {
    let value: Set<string> = new Set<string>();

    if (fieldIdKey === fieldId) {
      value = inputDescriptorIds;
    }

    return value;
  }

  private static addEntry(fieldIdzInputDescriptors: Map<Set<string>, Set<string>>, fieldId, inputDescriptor: string) {
    const fieldIds = new Set<string>();
    const inputDescriptors = new Set<string>();

    fieldIds.add(fieldId);
    inputDescriptors.add(inputDescriptor);

    fieldIdzInputDescriptors.set(fieldIds, inputDescriptors);
  }

  private getAllDescribedCredentialsPaths(vp: VerifiablePresentation) {
    vp.getPresentationSubmission().descriptor_map.forEach(this.descriptorToPathMapper());
  }

  private descriptorToPathMapper() {
    return (descriptor) => this.getDescribedCredentialPaths(descriptor);
  }

  private getDescribedCredentialPaths(descriptor: Descriptor) {
    this.allDescribedCredentialsPaths.set(descriptor.id, descriptor.path);

    if (descriptor.path_nested) {
      this.getDescribedCredentialPaths(descriptor.path_nested);
    }
  }

  private getAllCredentialSubjects(credentialsPaths: Map<string, string>, vp: VerifiablePresentation) {
    credentialsPaths.forEach(this.mapCredentialPathToCredentialSubject(vp));
  }

  private mapCredentialPathToCredentialSubject(vp: VerifiablePresentation) {
    return (inDescId, path) => {
      this.credentialsSubjects.set(inDescId, jp.nodes(vp, path).credentialSubject);
    };
  }

  private confirmAllFieldSetHasSameSubject(
    fieldIdzInputDescriptorsGroups: Map<Set<string>, Set<string>>,
    status: Status
  ) {
    fieldIdzInputDescriptorsGroups.forEach(this.confirmFieldSetHasSameSubject(status));
  }

  private confirmFieldSetHasSameSubject(status: 'info' | 'warn' | 'error') {
    return (fieldIdSet: Set<string>, inputDescriptorIds: Set<string>) => {
      const credentialSubjectsSet: Set<string> = new Set<string>();
      inputDescriptorIds.forEach((inDescId) => credentialSubjectsSet.add(this.credentialsSubjects.get(inDescId)));
      this.addResult(credentialSubjectsSet, fieldIdSet, status);
    };
  }

  private addResult(credentialSubjectsSet: Set<string>, fieldIdSet: Set<string>, status: Status) {
    let myStatus: Status = Status.INFO;

    if (credentialSubjectsSet.size > 1) {
      // not same subject
      myStatus = status;
    }

    this.getResults().push(this.getResult(fieldIdSet, credentialSubjectsSet, myStatus));
  }

  private getResult(fieldIdSet: Set<string>, credentialSubjectsSet: Set<string>, myStatus: Status): HandlerCheckResult {
    return {
      input_descriptor_path: fieldIdSet.toString(),
      verifiable_credential_path: credentialSubjectsSet.toString(),
      evaluator: this.getName(),
      status: myStatus,
      payload: { fieldIdSet: fieldIdSet, credentialSubjectsSet: credentialSubjectsSet },
      message: this.messages.get(myStatus),
    };
  }
}
