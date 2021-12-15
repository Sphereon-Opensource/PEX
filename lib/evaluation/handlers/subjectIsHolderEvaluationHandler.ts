import { HolderSubject, Optionality } from '@sphereon/pe-models';
import jp, { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { CredentialSubject, VerifiableCredential } from '../../types';
import { PresentationDefinition } from '../../types/SSI.types';
import { EvaluationClient } from '../evaluationClient';
import { HandlerCheckResult } from '../handlerCheckResult';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class SubjectIsHolderEvaluationHandler extends AbstractEvaluationHandler {
  private readonly fieldIdzInputDescriptorsSameSubjectRequired: Map<string, string[]>;
  private readonly fieldIdzInputDescriptorsSameSubjectPreferred: Map<string, string[]>;
  private readonly fieldIds: { path: PathComponent[]; value: string }[];
  private readonly isHolder: { path: PathComponent[]; value: HolderSubject }[];

  private credentialsSubjects: Map<string, CredentialSubject>;

  private messages: Map<Status, string>;

  constructor(client: EvaluationClient) {
    super(client);

    this.fieldIdzInputDescriptorsSameSubjectRequired = new Map<string, string[]>();
    this.fieldIdzInputDescriptorsSameSubjectPreferred = new Map<string, string[]>();
    this.isHolder = [];
    this.fieldIds = [];
    this.credentialsSubjects = new Map<string, CredentialSubject>();

    this.messages = new Map<Status, string>();
    this.messages.set(Status.INFO, 'The field ids requiring the subject to be the holder');
    this.messages.set(Status.WARN, 'The field ids preferring the subject to be the holder');
    this.messages.set(Status.ERROR, 'The field id missing');
  }

  public getName(): string {
    return 'IsHolderEvaluation';
  }

  public handle(pd: PresentationDefinition, vcs: VerifiableCredential[]): void {
    this.findIsHolderFieldIdsToInputDescriptorsSets(pd);
    this.findAllCredentialSubjects(vcs);
    this.confirmAllFieldSetHasSameSubject(
      this.fieldIdzInputDescriptorsSameSubjectRequired,
      Status.INFO,
      Optionality.Required
    );
    this.confirmAllFieldSetHasSameSubject(
      this.fieldIdzInputDescriptorsSameSubjectPreferred,
      Status.WARN,
      Optionality.Preferred
    );
    this.updatePresentationSubmission(pd);
  }

  /**
   * We have input descriptor to field ids mapping. This function gets a (reverse) map from field id to input descriptor
   */
  private findIsHolderFieldIdsToInputDescriptorsSets(pd: PresentationDefinition) {
    this.fieldIds.push(...jp.nodes(pd, '$..fields[*].id'));
    this.isHolder.push(...jp.nodes(pd, '$..is_holder[*]'));
    const fields: string[] = this.fieldIds?.map((n) => n.value) as string[];
    const error: [string, string[]][] = [];

    error.push(
      ...this.evaluateFields(
        this.fieldIdzInputDescriptorsSameSubjectPreferred,
        this.isHolder,
        fields,
        Optionality.Preferred
      )
    );
    error.push(
      ...this.evaluateFields(
        this.fieldIdzInputDescriptorsSameSubjectRequired,
        this.isHolder,
        fields,
        Optionality.Required
      )
    );

    error.forEach((q) => this.getResults().push(this.createResult(q[1], q[0], ['', {}], Status.ERROR)));
  }

  private evaluateFields(
    fieldsMapping: Map<string, string[]>,
    isHolder: { path: PathComponent[]; value: HolderSubject }[],
    fields: string[],
    directive: Optionality
  ) {
    const error: [string, string[]][] = [];
    isHolder
      .filter((d) => d.value.directive === directive)
      .filter((e) => e.value.field_id.every((id) => fields.includes(id)))
      .forEach((p) => fieldsMapping.set(jp.stringify(p.path.slice(0, 3)), p.value.field_id));

    isHolder
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

  private confirmAllFieldSetHasSameSubject(
    fieldIdzInputDescriptorsGroups: Map<string, string[]>,
    status: Status,
    directive: Optionality
  ) {
    const subjectsMatchingFields = Array.from(fieldIdzInputDescriptorsGroups).flatMap((k) =>
      Array.from(this.credentialsSubjects).filter((a) => k[1].find((c) => Object.keys(a[1]).includes(c)))
    );

    const credentialsToInputDescriptors = this.mapCredentialsToInputDescriptors(directive);

    const fields = Array.from(subjectsMatchingFields).flatMap((s) => Object.keys(s[1]).filter((w) => w !== 'id'));

    const allFieldsMatched: boolean = Array.from(fieldIdzInputDescriptorsGroups.values()).flatMap((v) =>
      v.every((e) => fields.includes(e))
    )[0];

    subjectsMatchingFields.forEach((subject) => {
      const inDescPath: string = credentialsToInputDescriptors.get(subject[0]) as string;
      if (allFieldsMatched && subject[1].id && this.client.dids.includes(subject[1].id)) {
        this.getResults().push(
          this.createResult(
            Object.keys(subject[1]).filter((k) => k !== 'id'),
            inDescPath,
            subject,
            status
          )
        );
      } else {
        this.getResults().push(
          this.createResult(
            Object.keys(subject[1]).filter((k) => k !== 'id'),
            inDescPath,
            subject,
            Status.ERROR
          )
        );
      }
    });
  }

  private mapCredentialsToInputDescriptors(directive: Optionality): Map<string, string> {
    const credentialsToInputDescriptors: Map<string, string> = new Map<string, string>();
    this.fieldIds?.forEach((id: { path: PathComponent[]; value: string }) => {
      const inDescPath = jp.stringify(id.path.slice(0, 3));
      this.credentialsSubjects.forEach((cs: CredentialSubject, credentialPath: string) => {
        const hs = this.isHolder.find((e) => jp.stringify(e.path.slice(0, 3)) === inDescPath);
        if (Object.keys(cs).includes(id.value) && hs?.value.directive === directive) {
          credentialsToInputDescriptors.set(credentialPath, inDescPath);
        }
      });
    });
    return credentialsToInputDescriptors;
  }

  private createResult(
    fieldIdSet: string[],
    inputDescriptorPath: string,
    credentialSub: [string, CredentialSubject],
    myStatus: Status,
    message?: string
  ): HandlerCheckResult {
    return {
      input_descriptor_path: inputDescriptorPath,
      verifiable_credential_path: credentialSub[0],
      evaluator: this.getName(),
      status: myStatus,
      payload: { fieldIdSet, credentialSubject: credentialSub[1] },
      message: message ?? this.messages.get(myStatus),
    };
  }
}
