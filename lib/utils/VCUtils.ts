import { AdditionalClaims, ICredential, ICredentialSubject, IIssuer } from '@sphereon/ssi-types';

import { DiscoveredVersion, IPresentationDefinition, PEVersion } from '../types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import validatePDv1 from '../validation/validatePDv1.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import validatePDv2 from '../validation/validatePDv2.js';

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
  let result = validatePDv2(data);
  if (result) {
    return { version: PEVersion.v2 };
  }
  result = validatePDv1(data);
  if (result) {
    return { version: PEVersion.v1 };
  }
  return { error: 'This is not a valid PresentationDefinition' };
}

export function uniformDIDMethods(dids?: string[], opts?: { removePrefix: 'did:' }) {
  let result = dids?.map((did) => did.toLowerCase()).map((did) => (did.startsWith('did:') ? did : `did:${did}`)) ?? [];
  if (opts?.removePrefix) {
    const length = opts.removePrefix.endsWith(':') ? opts.removePrefix.length : opts.removePrefix.length + 1;
    result = result.map((did) => (did.startsWith(opts.removePrefix) ? did.substring(length) : did));
  }
  if (result.includes('did')) {
    // The string did denotes every DID method, hence we return an empty array, indicating all methods are supported
    return [];
  }
  return result;
}

export function isRestrictedDID(DID: string, restrictToDIDMethods: string[]) {
  const methods = uniformDIDMethods(restrictToDIDMethods);
  return methods.length === 0 || methods.some((method) => DID.toLowerCase().startsWith(method));
}

export function filterToRestrictedDIDs(DIDs: string[], restrictToDIDMethods: string[]) {
  const methods = uniformDIDMethods(restrictToDIDMethods);
  if (methods.length === 0) {
    return DIDs;
  }
  return methods.flatMap((method) => DIDs.filter((DID) => DID.toLowerCase().startsWith(method)));
}
