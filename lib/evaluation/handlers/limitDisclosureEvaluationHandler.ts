import { InputDescriptorV1, InputDescriptorV2, Optionality } from '@sphereon/pex-models';
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
import { IInternalPresentationDefinition, InputDescriptorWithIndex, PathComponent } from '../../types';
import PexMessages from '../../types/Messages';
import { applySdJwtLimitDisclosure, JsonPathUtils } from '../../utils';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { elligibleInputDescriptorsForWrappedVc } from './markForSubmissionEvaluationHandler';

export class LimitDisclosureEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'LimitDisclosureEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    this.evaluateLimitDisclosure(pd.input_descriptors as InputDescriptorV2[], wrappedVcs);
  }

  private isLimitDisclosureSupported(
    elligibleInputDescriptors: InputDescriptorWithIndex[],
    wvc: WrappedVerifiableCredential,
    vcIndex: number,
  ): boolean {
    if (wvc.format === 'vc+sd-jwt') return true;

    const limitDisclosureSignatures = this.client.limitDisclosureSignatureSuites;
    const decoded = wvc.decoded as IVerifiableCredential;
    const proofs = Array.isArray(decoded.proof) ? decoded.proof : decoded.proof ? [decoded.proof] : undefined;
    const requiredLimitDisclosureInputDescriptorIds = elligibleInputDescriptors
      .map(({ inputDescriptor: { constraints }, inputDescriptorIndex }) =>
        constraints?.limit_disclosure === Optionality.Required ? inputDescriptorIndex : undefined,
      )
      .filter((id): id is number => id !== undefined);

    if (!proofs || proofs.length === 0 || proofs.length > 1 || !proofs[0].type) {
      // todo: Support/inspect array based proofs
      if (requiredLimitDisclosureInputDescriptorIds.length > 0) {
        this.createLimitDisclosureNotSupportedResult(
          elligibleInputDescriptors.map((i) => i.inputDescriptorIndex),
          vcIndex,
          'Multiple proofs on verifiable credential not supported for limit disclosure',
        );
      }
      return false;
    }

    const proof = proofs[0];
    const signatureSuite = proof.cryptosuite ? `${proof.type}.${proof.cryptosuite}` : proof.type;
    if (!limitDisclosureSignatures?.includes(signatureSuite)) {
      if (requiredLimitDisclosureInputDescriptorIds.length > 0) {
        this.createLimitDisclosureNotSupportedResult(
          requiredLimitDisclosureInputDescriptorIds,
          vcIndex,
          `Signature suite '${signatureSuite}' is not present in limitDisclosureSignatureSuites [${limitDisclosureSignatures.join(',')}]`,
        );
      }
      return false;
    }

    return true;
  }

  private evaluateLimitDisclosure(inputDescriptors: Array<InputDescriptorV2 | InputDescriptorV1>, wrappedVcs: WrappedVerifiableCredential[]): void {
    wrappedVcs.forEach((wvc, vcIndex) => {
      const elligibleInputDescriptors = elligibleInputDescriptorsForWrappedVc(inputDescriptors, vcIndex, this.getResults());
      const includeLimitDisclosure = elligibleInputDescriptors.some(
        ({ inputDescriptor: { constraints } }) =>
          constraints?.limit_disclosure === Optionality.Preferred || constraints?.limit_disclosure === Optionality.Required,
      );

      if (
        elligibleInputDescriptors.length > 0 &&
        includeLimitDisclosure &&
        this.isLimitDisclosureSupported(elligibleInputDescriptors, wvc, vcIndex)
      ) {
        this.enforceLimitDisclosure(wrappedVcs, elligibleInputDescriptors, vcIndex);
      }
    });
  }

  private enforceLimitDisclosure(wrappedVcs: WrappedVerifiableCredential[], elligibleInputDescriptors: InputDescriptorWithIndex[], vcIndex: number) {
    const wvc = wrappedVcs[vcIndex];

    if (CredentialMapper.isWrappedSdJwtVerifiableCredential(wvc)) {
      const presentationFrame = this.createSdJwtPresentationFrame(elligibleInputDescriptors, wvc.credential, vcIndex);

      // We update the SD-JWT to it's presentation format (remove disclosures, update pretty payload, etc..), except
      // we don't create or include the (optional) KB-JWT yet, this is done when we create the presentation
      if (presentationFrame) {
        applySdJwtLimitDisclosure(wvc.credential, presentationFrame);
        wvc.decoded = wvc.credential.decodedPayload;
        // We need to overwrite the original, as that is returned in the selectFrom method
        // But we also want to keep the format of the original credential.
        wvc.original = CredentialMapper.isSdJwtDecodedCredential(wvc.original) ? wvc.credential : wvc.credential.compactSdJwtVc;

        for (const { inputDescriptorIndex, inputDescriptor } of elligibleInputDescriptors) {
          this.createSuccessResult(inputDescriptorIndex, `$[${vcIndex}]`, inputDescriptor.constraints?.limit_disclosure);
        }
      }
    } else if (CredentialMapper.isW3cCredential(wvc.credential)) {
      const internalCredentialToSend = this.createVcWithRequiredFields(elligibleInputDescriptors, wvc.credential, vcIndex);
      /* When verifiableCredentialToSend is null/undefined an error is raised, the credential will
       * remain untouched and the verifiable credential won't be submitted.
       */
      if (internalCredentialToSend) {
        wvc.credential = internalCredentialToSend;
        for (const { inputDescriptorIndex, inputDescriptor } of elligibleInputDescriptors) {
          this.createSuccessResult(inputDescriptorIndex, `$[${vcIndex}]`, inputDescriptor.constraints?.limit_disclosure);
        }
      }
    } else {
      throw new Error(`Unsupported format for selective disclosure ${wvc.format}`);
    }
  }

  private createSdJwtPresentationFrame(
    inputDescriptors: InputDescriptorWithIndex[],
    vc: SdJwtDecodedVerifiableCredential,
    vcIndex: number,
  ): SdJwtPresentationFrame | undefined {
    // Mapping of key -> true to indicate which values should be disclosed in an SD-JWT
    // Can be nested array / object
    const presentationFrame: SdJwtPresentationFrame = {};

    for (const { inputDescriptor, inputDescriptorIndex } of inputDescriptors) {
      for (const field of inputDescriptor.constraints?.fields ?? []) {
        if (field.path) {
          const inputField = JsonPathUtils.extractInputField(vc.decodedPayload, field.path);

          // We set the value to true at the path in the presentation frame,
          if (inputField.length > 0) {
            const selectedField = inputField[0];
            JsonPathUtils.setValue(presentationFrame, selectedField.path, true);
          } else {
            this.createMandatoryFieldNotFoundResult(inputDescriptorIndex, vcIndex, field.path);
            return undefined;
          }
        }
      }
    }

    return presentationFrame;
  }

  private createVcWithRequiredFields(
    inputDescriptors: InputDescriptorWithIndex[],
    vc: IVerifiableCredential,
    vcIndex: number,
  ): IVerifiableCredential | undefined {
    let credentialToSend: IVerifiableCredential = {} as IVerifiableCredential;
    credentialToSend = Object.assign(credentialToSend, vc);
    credentialToSend.credentialSubject = {};

    for (const { inputDescriptor, inputDescriptorIndex } of inputDescriptors) {
      for (const field of inputDescriptor.constraints?.fields ?? []) {
        if (field.path) {
          const inputField = JsonPathUtils.extractInputField(vc, field.path);
          if (inputField.length > 0) {
            credentialToSend = this.copyResultPathToDestinationCredential(inputField[0], vc, credentialToSend);
          } else {
            this.createMandatoryFieldNotFoundResult(inputDescriptorIndex, vcIndex, field.path);
            return undefined;
          }
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

  private createSuccessResult(idIdx: number, path: string, limitDisclosure?: Optionality) {
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

  private createLimitDisclosureNotSupportedResult(idIdxs: number[], vcIdx: number, reason?: string) {
    return this.getResults().push(
      ...idIdxs.map((idIdx) => ({
        input_descriptor_path: `$.input_descriptors[${idIdx}]`,
        verifiable_credential_path: `$[${vcIdx}]`,
        evaluator: this.getName(),
        status: Status.ERROR,
        message: reason ? `${PexMessages.LIMIT_DISCLOSURE_NOT_SUPPORTED}. ${reason}` : PexMessages.LIMIT_DISCLOSURE_NOT_SUPPORTED,
      })),
    );
  }
}
