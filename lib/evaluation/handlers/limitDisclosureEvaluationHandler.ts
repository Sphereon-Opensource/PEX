import { ConstraintsV1, ConstraintsV2, FieldV2, InputDescriptorV2, Optionality } from '@sphereon/pex-models';
import { AdditionalClaims, ICredential, ICredentialSubject, IVerifiableCredential, WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition, InternalPresentationDefinitionV2, PathComponent } from '../../types';
import PexMessages from '../../types/Messages';
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

  public handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    // PresentationDefinitionV2 is the common denominator
    (pd as InternalPresentationDefinitionV2).input_descriptors.forEach((inDesc: InputDescriptorV2, index: number) => {
      if (
        inDesc.constraints?.fields &&
        (inDesc.constraints?.limit_disclosure === Optionality.Required || inDesc.constraints?.limit_disclosure === Optionality.Preferred)
      ) {
        this.evaluateLimitDisclosure(wrappedVcs, inDesc.constraints, index);
      }
    });
  }

  private isLimitDisclosureSupported(wvc: WrappedVerifiableCredential, vcIdx: number, idIdx: number, optionality: Optionality): boolean {
    const limitDisclosureSignatures = this.client.limitDisclosureSignatureSuites;
    const proof = (wvc.decoded as IVerifiableCredential).proof;
    if (!proof || Array.isArray(proof) || !proof.type) {
      // todo: Support/inspect array based proofs
      return false;
    } else if (!limitDisclosureSignatures?.includes(proof.type)) {
      if (optionality == Optionality.Required) {
        this.createLimitDisclosureNotSupportedResult(idIdx, vcIdx);
      }
      return false;
    }
    return true;
  }

  private evaluateLimitDisclosure(wrappedVcs: WrappedVerifiableCredential[], constraints: ConstraintsV1 | ConstraintsV2, idIdx: number): void {
    const fields = constraints?.fields as FieldV2[];
    const optionality = constraints.limit_disclosure;
    wrappedVcs.forEach((wvc, index) => {
      if (optionality && this.isLimitDisclosureSupported(wvc, index, idIdx, optionality)) {
        this.enforceLimitDisclosure(wvc.credential, fields, idIdx, index, wrappedVcs, optionality);
      }
    });
  }

  private enforceLimitDisclosure(
    vc: IVerifiableCredential,
    fields: FieldV2[],
    idIdx: number,
    index: number,
    wrappedVcs: WrappedVerifiableCredential[],
    limitDisclosure: Optionality,
  ) {
    const internalCredentialToSend = this.createVcWithRequiredFields(vc, fields, idIdx, index);
    /* When verifiableCredentialToSend is null/undefined an error is raised, the credential will
     * remain untouched and the verifiable credential won't be submitted.
     */
    if (internalCredentialToSend) {
      wrappedVcs[index].credential = internalCredentialToSend;
      this.createSuccessResult(idIdx, `$[${index}]`, limitDisclosure);
    }
  }

  private createVcWithRequiredFields(vc: IVerifiableCredential, fields: FieldV2[], idIdx: number, vcIdx: number): IVerifiableCredential | undefined {
    let credentialToSend: IVerifiableCredential = {} as IVerifiableCredential;
    credentialToSend = Object.assign(credentialToSend, vc);
    credentialToSend.credentialSubject = {};

    for (const field of fields) {
      if (field.path) {
        const inputField = JsonPathUtils.extractInputField(vc, field.path);
        if (inputField.length > 0) {
          credentialToSend = this.copyResultPathToDestinationCredential(inputField[0], vc, credentialToSend);
        } else {
          this.createMandatoryFieldNotFoundResult(idIdx, vcIdx, field.path);
          return undefined;
        }
      }
    }
    return credentialToSend;
  }

  private copyResultPathToDestinationCredential(
    requiredField: { path: PathComponent[]; value: unknown },
    internalCredential: ICredential,
    internalCredentialToSend: IVerifiableCredential,
  ): IVerifiableCredential {
    //TODO: ESSIFI-186
    let credentialSubject: ICredentialSubject & AdditionalClaims = { ...internalCredential.credentialSubject };
    requiredField.path.forEach((e) => {
      if (credentialSubject[e as keyof ICredentialSubject]) {
        credentialSubject = { [e]: credentialSubject[e as keyof ICredentialSubject] } as { [x: string]: unknown };
      }
    });
    internalCredentialToSend.credentialSubject = {
      ...internalCredentialToSend.credentialSubject,
      ...credentialSubject,
    };
    return internalCredentialToSend;
  }

  private createSuccessResult(idIdx: number, path: string, limitDisclosure: Optionality) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `${path}`,
      evaluator: this.getName(),
      status: limitDisclosure === Optionality.Required ? Status.INFO : Status.WARN,
      message: PexMessages.LIMIT_DISCLOSURE_APPLIED,
      payload: undefined,
    });
  }

  private createMandatoryFieldNotFoundResult(idIdx: number, vcIdx: number, path: string[]) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: PexMessages.VERIFIABLE_CREDENTIAL_MANDATORY_FIELD_NOT_PRESENT,
      payload: path,
    });
  }

  private createLimitDisclosureNotSupportedResult(idIdx: number, vcIdx: number) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: PexMessages.LIMIT_DISCLOSURE_NOT_SUPPORTED,
    });
  }
}
