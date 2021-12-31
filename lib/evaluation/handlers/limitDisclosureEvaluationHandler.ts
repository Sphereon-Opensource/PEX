import { ConstraintsV1, ConstraintsV2, FieldV2, InputDescriptorV2, Optionality } from '@sphereon/pex-models';
import { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import {
  IInternalPresentationDefinition,
  InternalPresentationDefinitionV2,
  InternalVerifiableCredential,
  InternalVerifiableCredentialJsonLD,
  InternalVerifiableCredentialJwt,
} from '../../types/Internal.types';
import PEMessages from '../../types/Messages';
import { JsonPathUtils } from '../../utils';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class LimitDisclosureEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'LimitDisclosureEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition, vcs: InternalVerifiableCredential[]): void {
    // PresentationDefinitionV2 is the common denominator
    (pd as InternalPresentationDefinitionV2).input_descriptors.forEach((inDesc: InputDescriptorV2, index: number) => {
      if (
        inDesc.constraints?.fields &&
        (inDesc.constraints?.limit_disclosure === Optionality.Required ||
          inDesc.constraints?.limit_disclosure === Optionality.Preferred)
      ) {
        this.evaluateLimitDisclosure(vcs, inDesc.constraints, index);
      }
    });
  }

  private isLimitDisclosureSupported(
    vc: InternalVerifiableCredential,
    vcIdx: number,
    idIdx: number,
    optionality: Optionality
  ): boolean {
    const limitDisclosureSignatures = this.client.limitDisclosureSignatureSuites;
    if (!vc.proof || Array.isArray(vc.proof) || !vc.proof.type) {
      // todo: Support/inspect array based proofs
      return false;
    } else if (!limitDisclosureSignatures?.includes(vc.proof.type)) {
      if (optionality == Optionality.Required) {
        this.createLimitDisclosureNotSupportedResult(idIdx, vcIdx);
      }
      return false;
    }
    return true;
  }

  private evaluateLimitDisclosure(
    verifiableCredential: InternalVerifiableCredential[],
    constraints: ConstraintsV1 | ConstraintsV2,
    idIdx: number
  ): void {
    const fields = constraints?.fields as FieldV2[];
    const optionality = constraints.limit_disclosure;
    verifiableCredential.forEach((vc, index) => {
      if (optionality && this.isLimitDisclosureSupported(vc, index, idIdx, optionality)) {
        this.enforceLimitDisclosure(vc, fields, idIdx, index, verifiableCredential, optionality);
      }
    });
  }

  private enforceLimitDisclosure(
    vc: InternalVerifiableCredential,
    fields: FieldV2[],
    idIdx: number,
    index: number,
    verifiableCredential: InternalVerifiableCredential[],
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
    vc: InternalVerifiableCredential,
    fields: FieldV2[],
    idIdx: number,
    vcIdx: number
  ): InternalVerifiableCredential | undefined {
    let vcToSend: InternalVerifiableCredential;
    if (vc.getType() === 'jwt') {
      vcToSend = new InternalVerifiableCredentialJwt();
      vcToSend = { ...vc } as unknown as InternalVerifiableCredentialJwt;
      vcToSend = Object.assign(vcToSend, vc);
      vcToSend.getBaseCredential().credentialSubject = {};
    } else {
      vcToSend = new InternalVerifiableCredentialJsonLD();
      vcToSend = Object.assign(vcToSend, vc);
      vcToSend.getBaseCredential().credentialSubject = {};
    }
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
    verifiableCredential: InternalVerifiableCredential,
    verifiableCredentialToSend: InternalVerifiableCredential
  ): InternalVerifiableCredential {
    let credentialSubject = { ...verifiableCredential?.getBaseCredential().credentialSubject };
    requiredField.path.forEach((e) => {
      if (credentialSubject[e]) {
        credentialSubject = { [e]: credentialSubject[e] } as { [x: string]: unknown };
      }
    });
    verifiableCredentialToSend.getBaseCredential().credentialSubject = {
      ...verifiableCredentialToSend.getBaseCredential().credentialSubject,
      ...credentialSubject,
    };
    return verifiableCredentialToSend;
  }

  private createSuccessResult(idIdx: number, path: string, limitDisclosure: Optionality) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `${path}`,
      evaluator: this.getName(),
      status: limitDisclosure === Optionality.Required ? Status.INFO : Status.WARN,
      message: PEMessages.LIMIT_DISCLOSURE_APPLIED,
      payload: undefined,
    });
  }

  private createMandatoryFieldNotFoundResult(idIdx: number, vcIdx: number, path: string[]) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: PEMessages.VERIFIABLE_CREDENTIAL_MANDATORY_FIELD_NOT_PRESENT,
      payload: path,
    });
  }

  private createLimitDisclosureNotSupportedResult(idIdx: number, vcIdx: number) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: PEMessages.LIMIT_DISCLOSURE_NOT_SUPPORTED,
    });
  }
}
