import { Descriptor, InputDescriptorV1 } from '@sphereon/pex-models';
import jp from 'jsonpath';
import { nanoid } from 'nanoid';

import { Status } from '../../ConstraintUtils';
import { ICredentialSchema, PEVersion } from '../../types';
import {
  IInternalPresentationDefinition,
  InternalPresentationDefinitionV1,
  InternalVerifiableCredential,
} from '../../types/Internal.types';
import PEMessages from '../../types/Messages';
import { EvaluationClient } from '../evaluationClient';
import { HandlerCheckResult } from '../handlerCheckResult';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class UriEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'UriEvaluation';
  }

  private static HASHLINK_URL_ENCODED_REGEX = /hl:[a-zA-Z0-9]+:[a-zA-Z0-9]+/g;
  private static HASHLINK_QUERY_URL_REGEX =
    /https*?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(hl=[a-zA-Z0-9]+)/g;

  public handle(d: IInternalPresentationDefinition, vcs: InternalVerifiableCredential[]): void {
    // This filter is removed in V2
    (<InternalPresentationDefinitionV1>d).input_descriptors.forEach((inDesc: InputDescriptorV1, i: number) => {
      const uris: string[] = d.getVersion() !== PEVersion.v2 ? inDesc.schema.map((so) => so.uri) : [];
      vcs.forEach((vc: InternalVerifiableCredential, j: number) => {
        const vcUris: string[] = UriEvaluationHandler.buildVcContextAndSchemaUris(vc);
        this.evaluateUris(vc, vcUris, uris, i, j, d.getVersion());
      });
    });
    const descriptorMap: Descriptor[] = this.getResults()
      .filter((e) => e.status === Status.INFO)
      .map((e) => {
        const inputDescriptor: InputDescriptorV1 = jp.nodes(d, e.input_descriptor_path)[0].value;
        return {
          id: inputDescriptor.id,
          format: 'ldp_vc',
          path: e.verifiable_credential_path,
        };
      });
    this.presentationSubmission = {
      id: nanoid(),
      definition_id: d.id,
      descriptor_map: descriptorMap,
    };
  }

  private evaluateUris(
    vc: InternalVerifiableCredential,
    verifiableCredentialUris: string[],
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number,
    pdVersion: PEVersion
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
      this.getResults().push(this.createSuccessResultObject(vc, inputDescriptorsUris, idIdx, vcIdx));
    } else {
      this.getResults().push(this.createErrorResultObject(vc, inputDescriptorsUris, idIdx, vcIdx));
    }
  }

  private static buildVcContextAndSchemaUris(vc: InternalVerifiableCredential) {
    const uris: string[] = [];
    if (Array.isArray(vc.getContext())) {
      uris.push(...vc.getContext());
    } else {
      uris.push(<string>vc.getContext());
    }
    if (Array.isArray(vc.getCredentialSchema()) && (vc.getCredentialSchema() as ICredentialSchema[]).length > 0) {
      (vc.getCredentialSchema() as ICredentialSchema[]).forEach((element) => uris.push(element.id));
    } else if (vc.getCredentialSchema()) {
      uris.push((vc.getCredentialSchema() as ICredentialSchema).id);
    }
    return uris;
  }

  private createSuccessResultObject(
    vc: InternalVerifiableCredential,
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number
  ) {
    const result: HandlerCheckResult = this.createResult(idIdx, vcIdx);
    result.status = Status.INFO;
    result.message = PEMessages.URI_EVALUATION_PASSED;
    result.payload = {
      vcContext: vc.getContext(),
      vcCredentialSchema: vc.getCredentialSchema(),
      inputDescriptorsUris,
    };
    return result;
  }

  private createErrorResultObject(
    vc: InternalVerifiableCredential,
    inputDescriptorsUris: string[],
    idIdx: number,
    vcIdx: number
  ) {
    const result = this.createResult(idIdx, vcIdx);
    result.status = Status.ERROR;
    result.message = PEMessages.URI_EVALUATION_DIDNT_PASS;
    result.payload = {
      vcContext: vc.getContext(),
      vcCredentialSchema: vc.getCredentialSchema(),
      inputDescriptorsUris,
    };
    return result;
  }

  private createWarnResultObject(idIdx: number, vcIdx: number) {
    const result = this.createResult(idIdx, vcIdx);
    result.status = Status.WARN;
    result.message = PEMessages.URI_EVALUATION_DIDNT_PASS;
    result.payload = PEMessages.INPUT_DESCRIPTOR_CONTEXT_CONTAINS_HASHLINK_VERIFICATION_NOT_SUPPORTED;
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

  private static containsHashlink(url: string) {
    return !(
      url.matchAll(UriEvaluationHandler.HASHLINK_QUERY_URL_REGEX).next().done &&
      url.matchAll(UriEvaluationHandler.HASHLINK_URL_ENCODED_REGEX).next().done
    );
  }
}
