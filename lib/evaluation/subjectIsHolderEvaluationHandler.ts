import { Descriptor, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import jp from 'jsonpath';

import { Status } from '../ConstraintUtils';
import { VerifiablePresentation } from '../verifiablePresentation';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { EvaluationClient } from './evaluationClient';
import { HandlerCheckResult } from './handlerCheckResult';

export class SubjectIsHolderEvaluationHandler extends AbstractEvaluationHandler {
  public getName(): string {
    return 'IsHolderEvaluation';
  }

  private pDefinition: PresentationDefinition;
  private vPresentation: VerifiablePresentation;

  private readonly fieldIdzInputDescriptorsIsHolderRequired: Map<Set<string>, Set<string>>;
  private readonly fieldIdzInputDescriptorsIsHolderPreferred: Map<Set<string>, Set<string>>;
  private readonly allDescribedCredentialsPaths: Map<string, string>;

  private credentialsSubjects: Map<string, unknown>;

  private messages: Map<Status, string>;

  constructor(client: EvaluationClient) {
    super(client);

    this.fieldIdzInputDescriptorsIsHolderRequired = new Map<Set<string>, Set<string>>();
    this.fieldIdzInputDescriptorsIsHolderPreferred = new Map<Set<string>, Set<string>>();
    this.allDescribedCredentialsPaths = new Map<string, string>();

    this.credentialsSubjects = new Map<string, string>();

    this.messages = new Map<Status, string>();
    this.messages.set(Status.INFO, 'The field ids requiring the subject to be the holder');
    this.messages.set(Status.WARN, 'The field ids preferring the subject to be the holder');
    this.messages.set(Status.ERROR, 'The field ids requiring the subject to be the holder');
  }

  public handle(pd: PresentationDefinition): void {
    this.pDefinition = pd;
    this.vPresentation = this.client.verifiablePresentation;

    this.findIsHolderFieldIdsToInputDescriptorsSets();
    this.findAllDescribedCredentialsPaths();
    this.findAllCredentialSubjects();

    this.confirmAllFieldSetHasSameHolder(this.fieldIdzInputDescriptorsIsHolderRequired, Status.ERROR);
    this.confirmAllFieldSetHasSameHolder(this.fieldIdzInputDescriptorsIsHolderPreferred, Status.WARN);
  }

  private findIsHolderFieldIdsToInputDescriptorsSets() {
    this.pDefinition.input_descriptors.forEach(this.mapFieldIdsToInputDescriptors());
  }

  private mapFieldIdsToInputDescriptors() {
    return (inputDescriptor) => {
      inputDescriptor.constraints.is_holder?.forEach(this.mapIsHolderToInputDescriptors(inputDescriptor));
    };
  }

  private mapIsHolderToInputDescriptors(inDesc: InputDescriptor) {
    return (sameSubjectGroup) => {
      let fieldIdzInputDescriptors;

      if (sameSubjectGroup.directive === Optionality.Required) {
        fieldIdzInputDescriptors = this.fieldIdzInputDescriptorsIsHolderRequired;
      } else if (sameSubjectGroup.directive === Optionality.Preferred) {
        fieldIdzInputDescriptors = this.fieldIdzInputDescriptorsIsHolderPreferred;
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
      this.addEntry(fieldIdzInputDescriptors, searchableFieldIds, inputDescriptorIds);
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

  private addEntry(
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
    if (this.vPresentation.getPresentationSubmission()) {
      this.vPresentation.getPresentationSubmission().descriptor_map.forEach(this.descriptorToPathMapper());
    }
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
      const subjectNode = jp.nodes(this.vPresentation.getRoot(), path.concat('..credentialSubject'));
      if (subjectNode.length) {
        this.credentialsSubjects.set(inDescId, subjectNode[0]);
      }
    };
  }

  private confirmAllFieldSetHasSameHolder(
    fieldIdzInputDescriptorsGroups: Map<Set<string>, Set<string>>,
    status: Status
  ) {
    fieldIdzInputDescriptorsGroups.forEach(this.confirmFieldSetHasSameHolder(status));
  }

  private confirmFieldSetHasSameHolder(status: 'info' | 'warn' | 'error') {
    return (inputDescriptorIds: Set<string>, fieldIdSet: Set<string>) => {
      const credentialSubjectsSet: Set<unknown> = new Set<unknown>();
      inputDescriptorIds.forEach((inDescId) => {
        if (this.credentialsSubjects.has(inDescId)) {
          credentialSubjectsSet.add(this.credentialsSubjects.get(inDescId));
        }
      });
      this.addResult(credentialSubjectsSet, fieldIdSet, status);
    };
  }

  private addResult(credentialSubjectsSet: Set<unknown>, fieldIdSet: Set<string>, status: Status) {
    let myStatus: Status = status === Status.ERROR ? Status.INFO : status;
    credentialSubjectsSet.forEach((cs) => {
      if (cs['value']['id'] !== this.client.did) {
        myStatus = Status.ERROR;
      }
    });
    const intersection = Array.from(fieldIdSet).filter(
      (value) => !this.getCredentialFields(credentialSubjectsSet).includes(value)
    );
    if (intersection.length > 0) {
      myStatus = Status.ERROR;
    }
    this.getResults().push(this.getResult(fieldIdSet, credentialSubjectsSet, myStatus));
  }

  private getResult(
    fieldIdSet: Set<string>,
    credentialSubjectsSet: Set<unknown>,
    myStatus: Status
  ): HandlerCheckResult {
    const paths: Array<string> = Array.from(credentialSubjectsSet).map((el) => jp.stringify(el['path'].slice(0, 3)));
    const inputDescriptorPath = '[' + Array.from(fieldIdSet).join(',') + ']';
    const verifiableCredentialPath = '[' + paths.join(',') + ']';
    const credentialFields: Array<string> = this.getCredentialFields(credentialSubjectsSet);
    return {
      input_descriptor_path: inputDescriptorPath,
      verifiable_credential_path: verifiableCredentialPath,
      evaluator: this.getName(),
      status: myStatus,
      payload: { fieldIdSet: inputDescriptorPath, credentialSubjectsSet: credentialFields },
      message: this.messages.get(myStatus),
    };
  }

  private getCredentialFields(credentialSubjectsSet: Set<unknown>): string[] {
    if (credentialSubjectsSet.size) {
      return Array.from(credentialSubjectsSet)
        .map((el) => Object.keys(el['value']))
        .reduce((acc, val) => acc.concat(val))
        .filter((x) => x !== 'id');
    } else {
      return [];
    }
  }
}
