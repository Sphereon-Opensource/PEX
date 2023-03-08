import { AdditionalClaims, ICredential, ICredentialSubject, IIssuer } from '@sphereon/ssi-types';

import { ObjectUtils } from './ObjectUtils';

export function getSubjectIdsAsString(vc: ICredential): string[] {
  const subjects: (ICredentialSubject & AdditionalClaims)[] = Array.isArray(vc.credentialSubject) ? vc.credentialSubject : [vc.credentialSubject];
  return subjects.filter((s) => !!s.id).map((value) => value.id) as string[];
}

export function getIssuerString(vc: ICredential): string {
  return ObjectUtils.isString(vc.issuer) ? (vc.issuer as string) : (vc.issuer as IIssuer).id;
}
