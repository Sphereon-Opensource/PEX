import { JSONPath as jp } from '@astronautlabs/jsonpath';
import { Descriptor, InputDescriptorV1 } from '@sphereon/pex-models';
import { ICredential, ICredentialSchema, WrappedVerifiableCredential } from '@sphereon/ssi-types';
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
    const descriptorMap: Descriptor[] = this.getResults()
      .filter((result) => result.status === Status.INFO)
      .map((result) => {
        const inputDescriptor: InputDescriptorV1 = jp.nodes(definition, result.input_descriptor_path)[0].value;
        return {
          id: inputDescriptor.id,
          format: result.payload?.format,
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

  private static buildVcContextAndSchemaUris(credential: ICredential, version: PEVersion) {
    const uris: string[] = [];
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
      Array.isArray(credential.type) ? credential.type.forEach((type) => uris.push(type)) : credential.type ? uris.push(credential.type) : undefined;
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
      vcContext: wvc.credential['@context'],
      vcCredentialSchema: wvc.credential.credentialSchema,
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
      vcContext: wvc.credential['@context'],
      vcCredentialSchema: wvc.credential.credentialSchema,
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
