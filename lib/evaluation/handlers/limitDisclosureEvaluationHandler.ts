import { Constraints, Field, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { JsonPathUtils } from '../../utils/jsonPathUtils';
import { VerifiableCredential } from '../../verifiablePresentation';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class LimitDisclosureEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'LimitDisclosureEvaluation';
  }

  public handle(pd: PresentationDefinition, vcs: VerifiableCredential[]): void {
    pd.input_descriptors.forEach((inDesc: InputDescriptor, index: number) => {
      if (
        inDesc.constraints?.fields &&
        (inDesc.constraints?.limit_disclosure === Optionality.Required ||
          inDesc.constraints?.limit_disclosure === Optionality.Preferred)
      ) {
        this.evaluateLimitDisclosure(vcs, inDesc.constraints, index);
      }
    });
  }

  private isLimitDisclosureSupported(vc: VerifiableCredential, vcIdx: number, idIdx: number): boolean {
    const limitDisclosureSignatures = this.client.limitDisclosureSignatureSuites;
    if (!limitDisclosureSignatures?.includes(vc.proof.type)) {
      this.createLimitDisclosureNotSupportedResult(idIdx, vcIdx);
      return false;
    }
    return true;
  }

  private evaluateLimitDisclosure(
    verifiableCredential: VerifiableCredential[],
    constraints: Constraints,
    idIdx: number
  ): void {
    const fields = constraints?.fields as Field[];
    const limitDisclosure = constraints.limit_disclosure as Optionality;
    verifiableCredential.forEach((vc, index) => {
      if (this.isLimitDisclosureSupported(vc, index, idIdx)) {
        this.enforceLimitDisclosure(vc, fields, idIdx, index, verifiableCredential, limitDisclosure);
      }
    });
  }

  private enforceLimitDisclosure(
    vc: VerifiableCredential,
    fields: Field[],
    idIdx: number,
    index: number,
    verifiableCredential: VerifiableCredential[],
    limitDisclosure: Optionality
  ) {
    const verifiableCredentialToSend = this.createVcWithRequiredFields(vc, fields, idIdx, index);
    /* When verifiableCredentialToSend is null/undefined an error is raised, the credential will
     * remain untouched and the verifiable credential won't be submitted.
     */
    if (verifiableCredentialToSend) {
      verifiableCredential[index] = verifiableCredentialToSend;
      this.createSuccessResult(idIdx, `$[${index}]`, limitDisclosure);
    }
  }

  private createVcWithRequiredFields(
    vc: VerifiableCredential,
    fields: Field[],
    idIdx: number,
    vcIdx: number
  ): VerifiableCredential | undefined {
    let vcToSend: VerifiableCredential = { ...vc, credentialSubject: {} };
    for (const field of fields) {
      if (field.path) {
        const inputField = JsonPathUtils.extractInputField(vc, field.path);
        if (inputField.length > 0) {
          vcToSend = this.copyResultPathToDestinationCredential(inputField[0], vc, vcToSend);
        } else {
          this.createMandatoryFieldNotFoundResult(idIdx, vcIdx, field.path);
          return undefined;
        }
      }
    }
    return vcToSend;
  }

  private copyResultPathToDestinationCredential(
    requiredField: { path: PathComponent[]; value: unknown },
    verifiableCredential: VerifiableCredential,
    verifiableCredentialToSend: VerifiableCredential
  ): VerifiableCredential {
    let credentialSubject = { ...verifiableCredential?.credentialSubject };
    requiredField.path.forEach((e) => {
      if (credentialSubject[e]) {
        credentialSubject = { [e]: credentialSubject[e] } as { [x: string]: unknown };
      }
    });
    return {
      ...verifiableCredentialToSend,
      credentialSubject: { ...verifiableCredentialToSend.credentialSubject, ...credentialSubject },
    };
  }

  private createSuccessResult(idIdx: number, path: string, limitDisclosure: Optionality) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `${path}`,
      evaluator: this.getName(),
      status: limitDisclosure === Optionality.Required ? Status.INFO : Status.WARN,
      message: 'added variable in the limit_disclosure to the verifiableCredential',
      payload: undefined,
    });
  }

  private createMandatoryFieldNotFoundResult(idIdx: number, vcIdx: number, path: string[]) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: 'mandatory field not present in the verifiableCredential',
      payload: path,
    });
  }

  private createLimitDisclosureNotSupportedResult(idIdx: number, vcIdx: number) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: 'Limit disclosure not supported',
    });
  }
}
