import { ConstraintsV1, ConstraintsV2, Optionality } from '@sphereon/pex-models';
import { ICredential, WrappedVerifiableCredential } from '@sphereon/ssi-types';
import { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition, InternalPresentationDefinitionV2 } from '../../types/Internal.types';
import PEMessages from '../../types/Messages';
import { JsonPathUtils } from '../../utils';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

// todo move to ssi-types
export interface IParsedDID {
  did: string;
  didUrl: string;
  method: string;
  id: string;
  path?: string;
  fragment?: string;
  query?: string;
  params?: {
    [index: string]: string;
  };
}

export class SubjectIsIssuerEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'SubjectIsIssuerEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    // PresentationDefinitionV2 is the common denominator
    (pd as InternalPresentationDefinitionV2).input_descriptors.forEach((inputDescriptor, index) => {
      const constraints: ConstraintsV1 | ConstraintsV2 | undefined = inputDescriptor.constraints;
      if (constraints?.subject_is_issuer === Optionality.Required) {
        this.checkSubjectIsIssuer(inputDescriptor.id, wrappedVcs, index);
      } else {
        this.getResults().push(
          ...wrappedVcs.map((_, vcIndex) => this.generateSuccessResult(index, `$[${vcIndex}]`, 'not applicable'))
        );
      }
    });
    this.updatePresentationSubmission(pd);
  }

  private checkSubjectIsIssuer(
    inputDescriptorId: string,
    wrappedVcs: WrappedVerifiableCredential[],
    idIdx: number
  ): void {
    this.client.presentationSubmission.descriptor_map.forEach((currentDescriptor) => {
      if (currentDescriptor.id === inputDescriptorId) {
        const vc: { path: PathComponent[]; value: ICredential }[] = JsonPathUtils.extractInputField(
          wrappedVcs.map((wvc) => wvc.internalCredential),
          [currentDescriptor.path]
        );
        const issuerId: string = typeof vc[0]?.value.issuer === 'string' ? vc[0]?.value.issuer : vc[0]?.value.issuer.id
        const normalizedIssuerId: string | null = this.normalizeDID(issuerId)
        const normalizedSubjectId: string | null = vc[0]?.value.credentialSubject.id ? this.normalizeDID(vc[0]?.value.credentialSubject.id) : null

        if (normalizedSubjectId && (normalizedSubjectId === normalizedIssuerId)) {
          this.getResults().push(this.generateSuccessResult(idIdx, currentDescriptor.path));
        } else {
          this.getResults().push(this.generateErrorResult(idIdx, currentDescriptor.path));
        }
      }
    });
  }

  private normalizeDID(did: string): string | null {
    const parsed: IParsedDID | null = this.parseDID(did)

    return parsed?.did || null
  }

  private parseDID(didUrl: string): IParsedDID | null {
    const PCT_ENCODED = '(?:%[0-9a-fA-F]{2})';
    const ID_CHAR = `(?:[a-zA-Z0-9._-]|${PCT_ENCODED})`;
    const METHOD = '([a-z0-9]+)';
    const METHOD_ID = `((?:${ID_CHAR}*:)*(${ID_CHAR}+))`;
    const PARAM_CHAR = '[a-zA-Z0-9_.:%-]';
    const PARAM = `;${PARAM_CHAR}+=${PARAM_CHAR}*`;
    const PARAMS = `((${PARAM})*)`;
    const PATH = `(/[^#?]*)?`;
    const QUERY = `([?][^#]*)?`;
    const FRAGMENT = `(#.*)?`;
    const DID_MATCHER = new RegExp(`^did:${METHOD}:${METHOD_ID}${PARAMS}${PATH}${QUERY}${FRAGMENT}$`);

    if (didUrl === '' || !didUrl) return null;

    const sections = didUrl.match(DID_MATCHER);

    if (sections) {
      const parts: IParsedDID = {
        did: `did:${sections[1]}:${sections[2]}`,
        method: sections[1],
        id: sections[2],
        didUrl,
      };

      if (sections[4]) {
        const params = sections[4].slice(1).split(';');
        parts.params = {};

        for (const p of params) {
          const kv = p.split('=');
          parts.params[kv[0]] = kv[1];
        }
      }

      if (sections[6]) parts.path = sections[6];
      if (sections[7]) parts.query = sections[7].slice(1);
      if (sections[8]) parts.fragment = sections[8].slice(1);

      return parts;
    }

    return null;
  }

  private generateErrorResult(idIdx: number, vcPath: string): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: PEMessages.SUBJECT_IS_NOT_ISSUER,
      verifiable_credential_path: vcPath,
    };
  }

  private generateSuccessResult(idIdx: number, vcPath: string, message?: string): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: message ?? PEMessages.SUBJECT_IS_ISSUER,
      verifiable_credential_path: vcPath,
    };
  }
}
