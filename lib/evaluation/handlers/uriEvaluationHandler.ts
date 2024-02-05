import { JSONPath as jp } from '@astronautlabs/jsonpath';
import { Descriptor, InputDescriptorV1, InputDescriptorV2 } from '@sphereon/pex-models';
import {
  CredentialMapper,
  ICredential,
  ICredentialSchema,
  OriginalType,
  SdJwtDecodedVerifiableCredential,
  WrappedVerifiableCredential,
} from '@sphereon/ssi-types';
import { nanoid } from 'nanoid';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition, InternalPresentationDefinitionV1, PEVersion } from '../../types';
import PexMessages from '../../types/Messages';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class UriEvaluationHandler extends AbstractEvaluationHandler {
  static matchAll = require('string.prototype.matchall');

  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'UriEvaluation';
  }

  private static HASHLINK_URL_ENCODED_REGEX = /hl:[a-zA-Z0-9]+:[a-zA-Z0-9]+/g;
  private static HASHLINK_QUERY_URL_REGEX =
    /https*?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(hl=[a-zA-Z0-9]+)/g;

  public handle(definition: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    // This filter is removed in V2
    (<InternalPresentationDefinitionV1>definition).input_descriptors.forEach((inDesc: InputDescriptorV1, descriptorIdx: number) => {
      const uris: string[] = definition.getVersion() !== PEVersion.v2 ? inDesc.schema.map((so) => so.uri) : [];
      wrappedVcs.forEach((wvc: WrappedVerifiableCredential, wrappedVCIdx: number) => {
        const vcUris: string[] = UriEvaluationHandler.buildVcContextAndSchemaUris(wvc.credential, definition.getVersion());
        this.evaluateUris(wvc, vcUris, uris, descriptorIdx, wrappedVCIdx, definition.getVersion());
      });
    });

    const definitionAllowsDataIntegrity = definition.format?.di || definition.format?.di_vc || definition.format?.di_vp;

    const descriptorMap: Descriptor[] = this.getResults()
      .filter((result) => result.status === Status.INFO)
      .map((result) => {
        let format = result.payload?.format;

        // This checks if the new data integrity format should be used.
        // That may be the case if the input descriptor points to credentials that are in ldp_vc or ldp format,
        // and the presentation definition allows data integrity.
        if (definitionAllowsDataIntegrity && (format === 'ldp_vc' || format === 'ldp')) {
          const wvcs: WrappedVerifiableCredential[] = jp.nodes(wrappedVcs, result.verifiable_credential_path).map((node) => node.value);

          // check if all vc's have a data integrity proof
          const vcDataIntegrityProofs = wvcs.map((vc) => {
            if (vc.type !== OriginalType.JSONLD || !vc.credential.proof) return [];
            const proofs = Array.isArray(vc.credential.proof) ? vc.credential.proof : [vc.credential.proof];
            const dataIntegrityProofs = proofs.filter((proof) => proof.type === 'DataIntegrityProof' && proof.cryptosuite !== undefined);

            return dataIntegrityProofs;
          });
          // determine the common cryptosuites of all vc's
          const commonCryptosuites = vcDataIntegrityProofs.reduce((a, b) => a.filter((c) => b.includes(c)));

          // the input descriptor should also allow data integrity
          const inputDescriptor: InputDescriptorV2 = jp.nodes(definition, result.input_descriptor_path)[0].value;
          const inputDescriptorAllowsDataIntegrity =
            !inputDescriptor['format'] || inputDescriptor?.format?.di || inputDescriptor?.format?.di_vc || inputDescriptor?.format?.di_vp;

          if (commonCryptosuites.length > 0 && inputDescriptorAllowsDataIntegrity) {
            format = 'di_vp';
          }
        }

        const inputDescriptor: InputDescriptorV1 = jp.nodes(definition, result.input_descriptor_path)[0].value;
        return {
          id: inputDescriptor.id,
          format,
          path: result.verifiable_credential_path,
        };
      });
    // The presentation submission is being created in this handler, then updated in subsequent handler.
    // TODO: This approach needs to be refactored for a new Major version.
    // Also there is no apparent need for the indirection and state in this class.
    // Simply do the first loops and amend the presentation submission in every loop.
    if (this.client.generatePresentationSubmission && (!this.presentationSubmission || Object.keys(this.presentationSubmission).length === 0)) {
      this.presentationSubmission = {
        id: nanoid(),
        definition_id: definition.id,
        descriptor_map: descriptorMap,
      };
    }
  }

  private evaluateUris(
    wvc: WrappedVerifiableCredential,
    verifiableCredentialUris: string[],
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number,
    pdVersion: PEVersion,
  ): void {
    let hasAnyMatch = false;
    if (pdVersion === PEVersion.v1) {
      for (let i = 0; i < inputDescriptorsUris.length; i++) {
        if (UriEvaluationHandler.containsHashlink(inputDescriptorsUris[i])) {
          this.getResults().push(this.createWarnResultObject(idIdx, vcIdx));
        }
      }
      for (let i = 0; i < verifiableCredentialUris.length; i++) {
        if (inputDescriptorsUris.find((el) => el === verifiableCredentialUris[i]) != undefined) {
          hasAnyMatch = true;
        }
      }
    } else {
      hasAnyMatch = true;
    }
    if (hasAnyMatch) {
      this.getResults().push(this.createSuccessResultObject(wvc, inputDescriptorsUris, idIdx, vcIdx));
    } else {
      this.getResults().push(this.createErrorResultObject(wvc, inputDescriptorsUris, idIdx, vcIdx));
    }
  }

  private static buildVcContextAndSchemaUris(credential: ICredential | SdJwtDecodedVerifiableCredential, version: PEVersion) {
    const uris: string[] = [];

    // W3C credential
    if (CredentialMapper.isW3cCredential(credential)) {
      if (Array.isArray(credential['@context'])) {
        credential['@context'].forEach((value) => uris.push(value as string));
      } else {
        uris.push(<string>credential['@context']);
      }
      if (Array.isArray(credential.credentialSchema) && (credential.credentialSchema as ICredentialSchema[]).length > 0) {
        (credential.credentialSchema as ICredentialSchema[]).forEach((element) => uris.push(element.id));
      } else if (credential.credentialSchema) {
        uris.push((credential.credentialSchema as ICredentialSchema).id);
      }
      if (version === PEVersion.v1) {
        // JWT VC Profile and MS Entry Verified ID do use the schema from V1 to match against types in the VC
        Array.isArray(credential.type)
          ? credential.type.forEach((type) => uris.push(type))
          : credential.type
            ? uris.push(credential.type)
            : undefined;
      }
    }

    // NOTE: we add the `vct` field of an SD-JWT to the list of uris, to allow SD-JWT
    // to work with PEX v1 in the same way that JWT vcs can work with pex v1. If we don't
    // add this, then SD-JWTs can only be used with PEX v2.
    if (CredentialMapper.isSdJwtDecodedCredential(credential)) {
      if (version === PEVersion.v1) {
        uris.push(credential.decodedPayload.vct);
      }
    }

    return uris;
  }

  private createSuccessResultObject(
    wvc: WrappedVerifiableCredential,
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number,
  ): HandlerCheckResult {
    const result: HandlerCheckResult = this.createResult(idIdx, vcIdx);
    result.status = Status.INFO;
    result.message = PexMessages.URI_EVALUATION_PASSED;
    result.payload = {
      format: wvc.format,
      vcContext: CredentialMapper.isW3cCredential(wvc.credential) ? wvc.credential['@context'] : undefined,
      vcCredentialSchema: CredentialMapper.isW3cCredential(wvc.credential) ? wvc.credential.credentialSchema : undefined,
      inputDescriptorsUris,
    };
    return result;
  }

  private createErrorResultObject(
    wvc: WrappedVerifiableCredential,
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number,
  ): HandlerCheckResult {
    const result = this.createResult(idIdx, vcIdx);
    result.status = Status.ERROR;
    result.message = PexMessages.URI_EVALUATION_DIDNT_PASS;
    result.payload = {
      format: wvc.format,
      vcContext: CredentialMapper.isW3cCredential(wvc.credential) ? wvc.credential['@context'] : undefined,
      vcCredentialSchema: CredentialMapper.isW3cCredential(wvc.credential) ? wvc.credential.credentialSchema : undefined,
      inputDescriptorsUris,
    };
    return result;
  }

  private createWarnResultObject(idIdx: number, vcIdx: number) {
    const result = this.createResult(idIdx, vcIdx);
    result.status = Status.WARN;
    result.message = PexMessages.URI_EVALUATION_DIDNT_PASS;
    result.payload = PexMessages.INPUT_DESCRIPTOR_CONTEXT_CONTAINS_HASHLINK_VERIFICATION_NOT_SUPPORTED;
    return result;
  }

  private createResult(idIdx: number, vcIdx: number): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: undefined,
    } as HandlerCheckResult;
  }

  private static containsHashlink(url: string): boolean {
    return !(
      this.matchAll(url, UriEvaluationHandler.HASHLINK_QUERY_URL_REGEX).next().done &&
      this.matchAll(url, UriEvaluationHandler.HASHLINK_URL_ENCODED_REGEX).next().done
    );
  }
}
