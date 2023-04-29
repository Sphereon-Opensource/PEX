import { AdditionalClaims, ICredential, ICredentialSubject, IIssuer } from '@sphereon/ssi-types';
import Ajv from 'ajv';

import { DiscoveredVersion, IPresentationDefinition, PEVersion } from '../types';
import { PresentationDefinitionSchema } from '../validation/core/presentationDefinitionSchema';

import { ObjectUtils } from './ObjectUtils';
import { JsonPathUtils } from './jsonPathUtils';

export function getSubjectIdsAsString(vc: ICredential): string[] {
  const subjects: (ICredentialSubject & AdditionalClaims)[] = Array.isArray(vc.credentialSubject) ? vc.credentialSubject : [vc.credentialSubject];
  return subjects.filter((s) => !!s.id).map((value) => value.id) as string[];
}

export function getIssuerString(vc: ICredential): string {
  return ObjectUtils.isString(vc.issuer) ? (vc.issuer as string) : (vc.issuer as IIssuer).id;
}

export function definitionVersionDiscovery(presentationDefinition: IPresentationDefinition): DiscoveredVersion {
  const presentationDefinitionCopy: IPresentationDefinition = JSON.parse(JSON.stringify(presentationDefinition));
  JsonPathUtils.changePropertyNameRecursively(presentationDefinitionCopy, '_const', 'const');
  JsonPathUtils.changePropertyNameRecursively(presentationDefinitionCopy, '_enum', 'enum');
  const data = { presentation_definition: presentationDefinitionCopy };
  const ajv = new Ajv({ verbose: true, allowUnionTypes: true, allErrors: true, strict: false });
  const validateV2 = ajv.compile(PresentationDefinitionSchema.getPresentationDefinitionSchemaV2());
  let result = validateV2(data);
  if (result) {
    return { version: PEVersion.v2 };
  }
  const validateV1 = ajv.compile(PresentationDefinitionSchema.getPresentationDefinitionSchemaV1());
  result = validateV1(data);
  if (result) {
    return { version: PEVersion.v1 };
  }
  return { error: 'This is not a valid PresentationDefinition' };
}
