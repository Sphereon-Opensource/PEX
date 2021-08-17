import { Descriptor, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import jp from 'jsonpath';

import { Status } from '../ConstraintUtils';
import { VerifiablePresentation } from '../verifiablePresentation';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { EvaluationClient } from './evaluationClient';
import { HandlerCheckResult } from './handlerCheckResult';

export class SameSubjectEvaluationHandler extends AbstractEvaluationHandler {
  private pDefinition: PresentationDefinition;
  private vPresentation: VerifiablePresentation;

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
    this.pDefinition = pd;
    this.vPresentation = vp;

    this.findSameSubjectFieldIdsToInputDescriptorsSets();
    this.findAllDescribedCredentialsPaths();
    this.findAllCredentialSubjects();

    this.confirmAllFieldSetHasSameSubject(this.fieldIdzInputDescriptorsSameSubjectRequired, Status.ERROR);
    this.confirmAllFieldSetHasSameSubject(this.fieldIdzInputDescriptorsSameSubjectPreferred, Status.WARN);
  }

  /**
   * We have input descriptor to field ids mapping. This function gets a (reverse) map from field id to input descriptor
   */
  private findSameSubjectFieldIdsToInputDescriptorsSets() {
    this.pDefinition.input_descriptors.forEach(this.mapFieldIdsToInputDescriptors());
  }

  private mapFieldIdsToInputDescriptors() {
    return (inputDescriptor) => {
      inputDescriptor.constraints.same_subject?.forEach(this.mapSameSubjectsToInputDescriptors(inputDescriptor));
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

      this.upsertFieldIdToInputDescriptorMapping(fieldIdzInputDescriptors, sameSubjectGroup.field_id, inDesc.id);
    };
  }

  /**
   * Update or insert the value in the map.
   *
   * @param fieldIdzInputDescriptors the map among which the value will be upserted.
   * @param searchableFieldIds the fields which are being added now
   * @param inDescId the input descriptor ids which is being mapped by the field ids
   *
   * @private
   */
  private upsertFieldIdToInputDescriptorMapping(
    fieldIdzInputDescriptors: Map<Set<string>, Set<string>>,
    searchableFieldIds: Array<string>,
    inDescId: string
  ) {
    const inputDescriptorIds: Array<string> = this.getAllInputDescriptorsWithAnyOfTheseFields(searchableFieldIds);
    inputDescriptorIds.push(inDescId);

    if (this.getValue(fieldIdzInputDescriptors, searchableFieldIds) == null) {
      SameSubjectEvaluationHandler.addEntry(fieldIdzInputDescriptors, searchableFieldIds, inputDescriptorIds);
    } else {
      this.updateEntry(fieldIdzInputDescriptors, searchableFieldIds, inputDescriptorIds);
    }
  }

  getAllInputDescriptorsWithAnyOfTheseFields(searchableFieldIds: Array<string>): Array<string> {
    return this.pDefinition.input_descriptors
      .filter(this.inputDescriptorsWithSameFields(searchableFieldIds))
      .map((filteredInDesces) => filteredInDesces.id);
  }

  private inputDescriptorsWithSameFields(searchableFieldIds: Array<string>) {
    return (inDesc) =>
      inDesc.constraints.fields.filter(this.fieldExistsInInputDescriptor(searchableFieldIds)).length > 0;
  }

  private fieldExistsInInputDescriptor(searchableFieldIds: Array<string>) {
    return (value) => searchableFieldIds.includes(value.id);
  }

  getValue(
    fieldIdzInputDescriptors: Map<Set<string>, Set<string>>,
    searchableFieldIds: Array<string>
  ): { mappedFieldIds; mappedInputDescriptorIds } {
    let entry: { mappedFieldIds: Set<string>; mappedInputDescriptorIds: Set<string> } = null;

    for (const [mappedFieldIds, mappedInputDescriptorIds] of fieldIdzInputDescriptors.entries()) {
      if (Array.from(mappedFieldIds.values()).filter((value) => searchableFieldIds.includes(value)).length > 0) {
        entry = { mappedFieldIds, mappedInputDescriptorIds };
      }
    }

    return entry;
  }

  private static addEntry(
    fieldIdzInputDescriptors: Map<Set<string>, Set<string>>,
    fieldIds: Array<string>,
    inputDescriptorIds: Array<string>
  ) {
    const addableFieldIds = new Set<string>(fieldIds);
    const addableInputDescriptors = new Set<string>(inputDescriptorIds);

    fieldIdzInputDescriptors.set(addableFieldIds, addableInputDescriptors);
  }

  private updateEntry(
    fieldIdzInputDescriptors: Map<Set<string>, Set<string>>,
    searchableFieldIds: Array<string>,
    inputDescriptorIds: Array<string>
  ) {
    const entry = this.getValue(fieldIdzInputDescriptors, searchableFieldIds);

    searchableFieldIds.forEach((searchableFieldId) => entry.mappedFieldIds.add(searchableFieldId));

    inputDescriptorIds.forEach((inputDescriptorId) => entry.mappedInputDescriptorIds.add(inputDescriptorId));
  }

  private findAllDescribedCredentialsPaths() {
    this.vPresentation.getPresentationSubmission().descriptor_map.forEach(this.descriptorToPathMapper());
  }

  private descriptorToPathMapper() {
    return (descriptor) => this.findDescribedCredentialPaths(descriptor);
  }

  private findDescribedCredentialPaths(descriptor: Descriptor) {
    this.allDescribedCredentialsPaths.set(descriptor.id, descriptor.path);

    if (descriptor.path_nested) {
      this.findDescribedCredentialPaths(descriptor.path_nested);
    }
  }

  private findAllCredentialSubjects() {
    this.allDescribedCredentialsPaths.forEach(this.mapCredentialPathToCredentialSubject());
  }

  private mapCredentialPathToCredentialSubject() {
    return (path, inDescId) => {
      const subjectNode = jp.nodes(this.vPresentation.getRoot(), path.concat('.credentialSubject'));
      if (subjectNode.length) {
        this.credentialsSubjects.set(inDescId, subjectNode[0].value);
      }
    };
  }

  private confirmAllFieldSetHasSameSubject(
    fieldIdzInputDescriptorsGroups: Map<Set<string>, Set<string>>,
    status: Status
  ) {
    fieldIdzInputDescriptorsGroups.forEach(this.confirmFieldSetHasSameSubject(status));
  }

  private confirmFieldSetHasSameSubject(status: 'info' | 'warn' | 'error') {
    return (inputDescriptorIds: Set<string>, fieldIdSet: Set<string>) => {
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
    const inputDescriptorPath = '[' + Array.from(fieldIdSet).join(',') + ']';
    const verifiableCredentialPath = '[' + Array.from(credentialSubjectsSet).join(',') + ']';
    return {
      input_descriptor_path: inputDescriptorPath,
      verifiable_credential_path: verifiableCredentialPath,
      evaluator: this.getName(),
      status: myStatus,
      payload: { fieldIdSet: inputDescriptorPath, credentialSubjectsSet: verifiableCredentialPath },
      message: this.messages.get(myStatus),
    };
  }
}
