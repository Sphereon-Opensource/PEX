import {
  HolderSubject,
  InputDescriptor, Optionality,
  PresentationDefinition
} from '@sphereon/pe-models';
import jp, { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import {
  CredentialSubject,
  VerifiableCredential
} from '../../verifiablePresentation';
import { EvaluationClient } from '../evaluationClient';
import { HandlerCheckResult } from '../handlerCheckResult';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class SameSubjectEvaluationHandler extends AbstractEvaluationHandler {

  private readonly fieldIdzInputDescriptorsSameSubjectRequired: Map<Set<string>, Set<string>>;
  private readonly fieldIdzInputDescriptorsSameSubjectPreferred: Map<Set<string>, Set<string>>;

  private credentialsSubjects: Map<string, CredentialSubject>;

  private messages: Map<Status, string>;

  constructor(client: EvaluationClient) {
    super(client);

    this.fieldIdzInputDescriptorsSameSubjectRequired = new Map<Set<string>, Set<string>>();
    this.fieldIdzInputDescriptorsSameSubjectPreferred = new Map<Set<string>, Set<string>>();

    this.credentialsSubjects = new Map<string, CredentialSubject>();

    this.messages = new Map<Status, string>();
    this.messages.set(Status.INFO, 'The field ids requiring the same subject to belong to same subject');
    this.messages.set(Status.WARN, 'The field ids preferring the same subject to belong to same subject');
    this.messages.set(Status.ERROR, 'The field ids requiring the same subject do not belong to same subject');
  }

  public getName(): string {
    return 'SameSubjectEvaluationHandler';
  }

  public handle(pd: PresentationDefinition, vcs: VerifiableCredential[]): void {
    this.findSameSubjectFieldIdsToInputDescriptorsSets(pd);
    this.findAllCredentialSubjects(vcs);
    this.confirmAllFieldSetHasSameSubject(this.fieldIdzInputDescriptorsSameSubjectRequired, Optionality.Required);
    this.confirmAllFieldSetHasSameSubject(this.fieldIdzInputDescriptorsSameSubjectPreferred, Optionality.Preferred);
    //TODO the credential needs to be mapped to an input descriptor
    this.presentationSubmission.descriptor_map = this.getResults()
      .filter((r) => r.status === Status.ERROR && r.evaluator === 'SameSubjectEvaluationHandler')
      .flatMap((r) => {
        /**
         * TODO map the nested credential
         */
        const inputDescriptor: InputDescriptor = jp.query(pd, r.input_descriptor_path)[0];
        return this.presentationSubmission.descriptor_map.filter(
          (ps) => ps.path !== r.verifiable_credential_path && ps.id !== inputDescriptor.id
        );
      });
  }

  /**
   * We have input descriptor to field ids mapping. This function gets a (reverse) map from field id to input descriptor
   */
  private findSameSubjectFieldIdsToInputDescriptorsSets(pd: PresentationDefinition) {
    const fieldIds: { path: PathComponent[], value: string }[] = jp.nodes(pd, '$..fields[*].id');
    const sameSubject: { path: PathComponent[], value: HolderSubject }[] = jp.nodes(pd, '$..same_subject[*]');
    const fields: [string, string][] = fieldIds.map(n => [jp.stringify(n.path.slice(0, 3)), n.value]);

    sameSubject.filter(d => d.value.directive === Optionality.Preferred)
      .filter(e => e.value.field_id.every(id => fields.map(f => f[1]).includes(id)))
    .forEach(p => this.fieldIdzInputDescriptorsSameSubjectPreferred.set(new Set(p.value.field_id), new Set([jp.stringify(p.path.slice(0,3))])));

    sameSubject.filter(d => d.value.directive === Optionality.Required)
      .filter(e => e.value.field_id.every(id => fields.map(f => f[1]).includes(id)))
    .forEach(p => this.fieldIdzInputDescriptorsSameSubjectRequired.set(new Set(p.value.field_id), new Set([jp.stringify(p.path.slice(0,3))])));
  }

  private findAllCredentialSubjects(vcs: VerifiableCredential[]) {
    //TODO handle nested path
    const credentialSubject: { path: PathComponent[], value: CredentialSubject }[] = jp.nodes(vcs, '$..credentialSubject');
    credentialSubject.forEach(cs => this.credentialsSubjects.set(jp.stringify(cs.path.slice(0, 2)), cs.value));
  }

  private confirmAllFieldSetHasSameSubject(
    fieldIdzInputDescriptorsGroups: Map<Set<string>, Set<string>>,
    directive: Optionality
  ) {
    //Return the vcs matching the field_id
    const subjectsMatchingFields = Array.from(fieldIdzInputDescriptorsGroups.keys()).flatMap(k =>
      Array.from(this.credentialsSubjects).filter(a => Array.from(k).find(c => Object.keys(a[1]).includes(c))));

    //Retrieve a list with all the fields from the vcs less the id
    const fields = Array.from(subjectsMatchingFields).flatMap(s => Object.keys(s[1]).filter(w => w !== 'id'));

    //Check if they match together all the fields
    const allMatched: boolean = Array.from(fieldIdzInputDescriptorsGroups.keys()).flatMap(k => Array.from(k).every(e => fields.includes(e)))[0];

    //Check if subject is the same
    const isSameSubject: boolean = new Set(Array.from(subjectsMatchingFields).flatMap(s => Object.keys(s[1]).filter(w => w === 'id'))).size === 1;
    const inDescPaths = Array.from(fieldIdzInputDescriptorsGroups.values()).flatMap(e => Array.from(e));
    if (allMatched && isSameSubject) {
      if (directive === Optionality.Required) {
        this.getResults().push(this.createResult(fields, inDescPaths , subjectsMatchingFields, Status.INFO))
      } else if (directive === Optionality.Preferred) {
        this.getResults().push(this.createResult(fields, inDescPaths , subjectsMatchingFields, Status.WARN))
      }
    } else {
      this.getResults().push(this.createResult(fields, inDescPaths , subjectsMatchingFields, Status.ERROR))
    }
  }


  private createResult(fieldIdSet: string[], inputDescriptorPaths: string[], credentialSubs: [string, CredentialSubject][], myStatus: Status): HandlerCheckResult {
    const credentialSubjects = credentialSubs.flatMap(e => e[1]);
    return {
      input_descriptor_path: Array.from(inputDescriptorPaths).join(','),
      verifiable_credential_path: '[' + Array.from(credentialSubs.map(e => e[0])).join(',') + ']',
      evaluator: this.getName(),
      status: myStatus,
      payload: { fieldIdSet: Array.from(fieldIdSet), credentialSubjects },
      message: this.messages.get(myStatus)
    };
  }
}
