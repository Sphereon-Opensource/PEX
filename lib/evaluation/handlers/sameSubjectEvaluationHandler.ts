import { HolderSubject, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import jp, { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { CredentialSubject, VerifiableCredential } from '../../verifiablePresentation';
import { EvaluationClient } from '../evaluationClient';
import { HandlerCheckResult } from '../handlerCheckResult';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class SameSubjectEvaluationHandler extends AbstractEvaluationHandler {
  private readonly fieldIdzInputDescriptorsSameSubjectRequired: Map<string, string[]>;
  private readonly fieldIdzInputDescriptorsSameSubjectPreferred: Map<string, string[]>;
  private fieldIds: { path: PathComponent[]; value: string }[] | undefined;

  private credentialsSubjects: Map<string, CredentialSubject>;

  private messages: Map<Status, string>;

  constructor(client: EvaluationClient) {
    super(client);

    this.fieldIdzInputDescriptorsSameSubjectRequired = new Map<string, string[]>();
    this.fieldIdzInputDescriptorsSameSubjectPreferred = new Map<string, string[]>();

    this.credentialsSubjects = new Map<string, CredentialSubject>();

    this.messages = new Map<Status, string>();
    this.messages.set(Status.INFO, 'The field ids requiring the same subject to belong to same subject');
    this.messages.set(Status.WARN, 'The field ids preferring the same subject to belong to same subject');
    this.messages.set(Status.ERROR, 'The field id is missing');
  }

  public getName(): string {
    return 'SameSubjectEvaluation';
  }

  public handle(pd: PresentationDefinition, vcs: VerifiableCredential[]): void {
    this.findSameSubjectFieldIdsToInputDescriptorsSets(pd);
    this.findAllCredentialSubjects(vcs);
    this.confirmAllFieldSetHasSameSubject(this.fieldIdzInputDescriptorsSameSubjectRequired, Status.INFO);
    this.confirmAllFieldSetHasSameSubject(this.fieldIdzInputDescriptorsSameSubjectPreferred, Status.WARN);
    this.presentationSubmission.descriptor_map = this.getResults()
      .filter((r) => r.status !== Status.ERROR && r.evaluator === 'SameSubjectEvaluation')
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
    this.fieldIds = jp.nodes(pd, '$..fields[*].id');
    const sameSubject: { path: PathComponent[]; value: HolderSubject }[] = jp.nodes(pd, '$..same_subject[*]');
    const fields: string[] = this.fieldIds?.map((n) => n.value) as string[];

    const error: [string, string[]][] = [];

    error.push(
      ...this.evaluateFields(
        this.fieldIdzInputDescriptorsSameSubjectPreferred,
        sameSubject,
        fields,
        Optionality.Preferred
      )
    );
    error.push(
      ...this.evaluateFields(
        this.fieldIdzInputDescriptorsSameSubjectRequired,
        sameSubject,
        fields,
        Optionality.Required
      )
    );

    error.forEach((q) => this.getResults().push(this.createResult(q[1], q[0], ['', {}], Status.ERROR)));
  }

  private evaluateFields(
    fieldsMapping: Map<string, string[]>,
    sameSubject: { path: PathComponent[]; value: HolderSubject }[],
    fields: string[],
    directive: Optionality
  ) {
    const error: [string, string[]][] = [];
    sameSubject
      .filter((d) => d.value.directive === directive)
      .filter((e) => e.value.field_id.every((id) => fields.includes(id)))
      .forEach((p) => fieldsMapping.set(jp.stringify(p.path.slice(0, 3)), p.value.field_id));

    sameSubject
      .filter((d) => d.value.directive === directive)
      .filter((e) => !e.value.field_id.every((id) => fields.includes(id)))
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
    const credentialMatchingFields = Array.from(fieldIdzInputDescriptorsGroups).flatMap((k) =>
      Array.from(this.credentialsSubjects).filter((a) => k[1].find((c) => Object.keys(a[1]).includes(c)))
    );

    const fields = Array.from(credentialMatchingFields).flatMap((s) => Object.keys(s[1]).filter((w) => w !== 'id'));

    const allFieldsMatched: boolean = Array.from(fieldIdzInputDescriptorsGroups.values()).flatMap((v) =>
      v.every((e) => fields.includes(e))
    )[0];

    const isSameSubject: boolean =
      new Set(Array.from(credentialMatchingFields).flatMap((s) => Object.keys(s[1]).filter((w) => w === 'id'))).size ===
      1;

    const credentialsToInputDescriptors = this.mapCredentialsToInputDescriptors();

    credentialMatchingFields.forEach((subject) => {
      const inDescPath: string = credentialsToInputDescriptors.get(subject[0]) as string;
      if (allFieldsMatched && isSameSubject) {
        this.getResults().push(this.createResult(fields, inDescPath, subject, status));
      } else {
        this.getResults().push(this.createResult(fields, inDescPath, subject, Status.ERROR));
      }
    });
  }

  private mapCredentialsToInputDescriptors(): Map<string, string> {
    const credentialsToInputDescriptors: Map<string, string> = new Map<string, string>();
    this.fieldIds?.forEach((id: { path: PathComponent[]; value: string }) => {
      this.credentialsSubjects.forEach((cs: CredentialSubject, credentialPath: string) => {
        if (Object.keys(cs).includes(id.value)) {
          credentialsToInputDescriptors.set(credentialPath, jp.stringify(id.path.slice(0, 3)));
        }
      });
    });
    return credentialsToInputDescriptors;
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
