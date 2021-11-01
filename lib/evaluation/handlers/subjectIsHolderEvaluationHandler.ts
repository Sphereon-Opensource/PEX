import { HolderSubject, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import jp, { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { CredentialSubject, VerifiableCredential } from '../../verifiablePresentation';
import { EvaluationClient } from '../evaluationClient';
import { HandlerCheckResult } from '../handlerCheckResult';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class SubjectIsHolderEvaluationHandler extends AbstractEvaluationHandler {
  private readonly fieldIdzInputDescriptorsSameSubjectRequired: Map<string, string[]>;
  private readonly fieldIdzInputDescriptorsSameSubjectPreferred: Map<string, string[]>;

  private credentialsSubjects: Map<string, CredentialSubject>;

  private messages: Map<Status, string>;

  constructor(client: EvaluationClient) {
    super(client);

    this.fieldIdzInputDescriptorsSameSubjectRequired = new Map<string, string[]>();
    this.fieldIdzInputDescriptorsSameSubjectPreferred = new Map<string, string[]>();

    this.credentialsSubjects = new Map<string, CredentialSubject>();

    this.messages = new Map<Status, string>();
    this.messages.set(Status.INFO, 'The field ids requiring the subject to be the holder');
    this.messages.set(Status.WARN, 'The field ids preferring the subject to be the holder');
    this.messages.set(Status.ERROR, 'The field ids requiring the subject to be the holder');
  }

  public getName(): string {
    return 'IsHolderEvaluation';
  }

  public handle(pd: PresentationDefinition, vcs: VerifiableCredential[]): void {
    this.findSameSubjectFieldIdsToInputDescriptorsSets(pd);
    this.findAllCredentialSubjects(vcs);
    this.confirmAllFieldSetHasSameSubject(this.fieldIdzInputDescriptorsSameSubjectRequired, Status.INFO);
    this.confirmAllFieldSetHasSameSubject(this.fieldIdzInputDescriptorsSameSubjectPreferred, Status.WARN);
    //TODO the credential needs to be mapped to an input descriptor
    this.presentationSubmission.descriptor_map = this.getResults()
      .filter((r) => r.status !== Status.ERROR && r.evaluator === 'IsHolderEvaluation')
      .flatMap((r) => {
        /**
         * TODO map the nested credential
         */
        const inputDescriptor: InputDescriptor = jp.query(pd, r.input_descriptor_path)[0];
        return this.presentationSubmission.descriptor_map.filter(
          (ps) => ps.path === r.verifiable_credential_path && ps.id === inputDescriptor.id
        );
      });
  }

  /**
   * We have input descriptor to field ids mapping. This function gets a (reverse) map from field id to input descriptor
   */
  private findSameSubjectFieldIdsToInputDescriptorsSets(pd: PresentationDefinition) {
    const fieldIds: { path: PathComponent[]; value: string }[] = jp.nodes(pd, '$..fields[*].id');
    const isHolder: { path: PathComponent[]; value: HolderSubject }[] = jp.nodes(pd, '$..is_holder[*]');
    const fields: [string, string][] = fieldIds.map((n) => [jp.stringify(n.path.slice(0, 3)), n.value]);

    const error: [string, string[]][] = [];

    //Validation case when input descriptor does not match fields with is_holder???
    error.push(
      ...this.evaluateFields(this.fieldIdzInputDescriptorsSameSubjectPreferred, isHolder, fields, Optionality.Preferred)
    );
    error.push(
      ...this.evaluateFields(this.fieldIdzInputDescriptorsSameSubjectRequired, isHolder, fields, Optionality.Required)
    );

    error.forEach((q) => this.getResults().push(this.createResult(q[1], q[0], ['', {}], Status.ERROR)));
  }

  private evaluateFields(
    fieldsMapping: Map<string, string[]>,
    isHolder: { path: PathComponent[]; value: HolderSubject }[],
    fields: [string, string][],
    directive: Optionality
  ) {
    const error: [string, string[]][] = [];
    isHolder
      .filter((d) => d.value.directive === directive)
      .filter((e) => e.value.field_id.every((id) => fields.map((f) => f[1]).includes(id)))
      .forEach((p) => fieldsMapping.set(jp.stringify(p.path.slice(0, 3)), p.value.field_id));

    isHolder
      .filter((d) => d.value.directive === directive)
      .filter((e) => !e.value.field_id.every((id) => fields.map((f) => f[1]).includes(id)))
      .forEach((p) => error.push([jp.stringify(p.path.slice(0, 3)), p.value.field_id]));
    return error;
  }

  private findAllCredentialSubjects(vcs: VerifiableCredential[]) {
    //TODO handle nested path
    const credentialSubject: { path: PathComponent[]; value: CredentialSubject }[] = jp.nodes(
      vcs,
      '$..credentialSubject'
    );
    credentialSubject.forEach((cs) => this.credentialsSubjects.set(jp.stringify(cs.path.slice(0, 2)), cs.value));
  }

  private confirmAllFieldSetHasSameSubject(fieldIdzInputDescriptorsGroups: Map<string, string[]>, status: Status) {
    const subjectsMatchingFields = Array.from(fieldIdzInputDescriptorsGroups).flatMap((k) =>
      Array.from(this.credentialsSubjects).filter((a) => k[1].find((c) => Object.keys(a[1]).includes(c)))
    );

    const credentialsToInputDescriptors: Map<string, [string, string[]]> = new Map<string, [string, string[]]>();
    Array.from(fieldIdzInputDescriptorsGroups).forEach((k) =>
      Array.from(this.credentialsSubjects)
        .filter((a) => k[1].find((c) => Object.keys(a[1]).includes(c)))
        .forEach((e) => credentialsToInputDescriptors.set(e[0], k))
    );

    const fields = Array.from(subjectsMatchingFields).flatMap((s) => Object.keys(s[1]).filter((w) => w !== 'id'));

    subjectsMatchingFields.forEach((subject) => {
      const inDescPath = credentialsToInputDescriptors.get(subject[0]) as [string, string[]];
      if (subject[1].id === this.client.did) {
        this.getResults().push(this.createResult(fields, inDescPath[0], subject, status));
      } else {
        this.getResults().push(this.createResult(fields, inDescPath[0], subject, Status.ERROR));
      }
    });
  }

  private createResult(
    fieldIdSet: string[],
    inputDescriptorPath: string,
    credentialSub: [string, CredentialSubject],
    myStatus: Status
  ): HandlerCheckResult {
    return {
      input_descriptor_path: inputDescriptorPath,
      verifiable_credential_path: credentialSub[0],
      evaluator: this.getName(),
      status: myStatus,
      payload: { fieldIdSet: Array.from(fieldIdSet), credentialSubject: credentialSub[1] },
      message: this.messages.get(myStatus),
    };
  }
}
