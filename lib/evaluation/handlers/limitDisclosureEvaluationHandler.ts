import { ConstraintsV1, ConstraintsV2, FieldV2, InputDescriptorV2, Optionality } from '@sphereon/pex-models';
import {
  AdditionalClaims,
  CredentialMapper,
  ICredential,
  ICredentialSubject,
  IVerifiableCredential,
  SdJwtDecodedVerifiableCredential,
  SdJwtPresentationFrame,
  WrappedVerifiableCredential,
} from '@sphereon/ssi-types';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition, InternalPresentationDefinitionV2, PathComponent } from '../../types';
import PexMessages from '../../types/Messages';
import { applySdJwtLimitDisclosure, JsonPathUtils } from '../../utils';
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
    if (wvc.format === 'vc+sd-jwt') return true;

    const limitDisclosureSignatures = this.client.limitDisclosureSignatureSuites;
    const proof = (wvc.decoded as IVerifiableCredential).proof;

    if (!proof || Array.isArray(proof) || !proof.type) {
      // todo: Support/inspect array based proofs
      return false;
    }

    const signatureSuite = proof.cryptosuite ? `${proof.type}.${proof.cryptosuite}` : proof.type;
    if (!limitDisclosureSignatures?.includes(signatureSuite)) {
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
        this.enforceLimitDisclosure(wvc, fields, idIdx, index, wrappedVcs, optionality);
      }
    });
  }

  private enforceLimitDisclosure(
    wvc: WrappedVerifiableCredential,
    fields: FieldV2[],
    idIdx: number,
    index: number,
    wrappedVcs: WrappedVerifiableCredential[],
    limitDisclosure: Optionality,
  ) {
    if (CredentialMapper.isWrappedSdJwtVerifiableCredential(wvc)) {
      const presentationFrame = this.createSdJwtPresentationFrame(wvc.credential, fields, idIdx, index);

      // We update the SD-JWT to it's presentation format (remove disclosures, update pretty payload, etc..), except
      // we don't create or include the (optional) KB-JWT yet, this is done when we create the presentation
      if (presentationFrame) {
        applySdJwtLimitDisclosure(wvc.credential, presentationFrame);
        wvc.decoded = wvc.credential.decodedPayload;
        // We need to overwrite the original, as that is returned in the selectFrom method
        // But we also want to keep the format of the original credential.
        wvc.original = CredentialMapper.isSdJwtDecodedCredential(wvc.original) ? wvc.credential : wvc.credential.compactSdJwtVc;

        this.createSuccessResult(idIdx, `$[${index}]`, limitDisclosure);
      }
    } else if (CredentialMapper.isW3cCredential(wvc.credential)) {
      const internalCredentialToSend = this.createVcWithRequiredFields(wvc.credential, fields, idIdx, index);
      /* When verifiableCredentialToSend is null/undefined an error is raised, the credential will
       * remain untouched and the verifiable credential won't be submitted.
       */
      if (internalCredentialToSend) {
        wrappedVcs[index].credential = internalCredentialToSend;
        this.createSuccessResult(idIdx, `$[${index}]`, limitDisclosure);
      }
    } else {
      throw new Error(`Unsupported format for selective disclosure ${wvc.format}`);
    }
  }

  private createSdJwtPresentationFrame(
    vc: SdJwtDecodedVerifiableCredential,
    fields: FieldV2[],
    idIdx: number,
    vcIdx: number,
  ): SdJwtPresentationFrame | undefined {
    // Mapping of key -> true to indicate which values should be disclosed in an SD-JWT
    // Can be nested array / object
    const presentationFrame: SdJwtPresentationFrame = {};

    for (const field of fields) {
      if (field.path) {
        const inputField = JsonPathUtils.extractInputField(vc.decodedPayload, field.path);

        // We set the value to true at the path in the presentation frame,
        if (inputField.length > 0) {
          const selectedField = inputField[0];
          JsonPathUtils.setValue(presentationFrame, selectedField.path, true);
        } else {
          this.createMandatoryFieldNotFoundResult(idIdx, vcIdx, field.path);
          return undefined;
        }
      }
    }

    return presentationFrame;
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
