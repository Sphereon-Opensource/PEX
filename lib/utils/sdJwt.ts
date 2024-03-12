import { getSDAlgAndPayload, unpackObj } from '@sd-jwt/decode';
import { createHashMappingForSerializedDisclosure, selectDisclosures } from '@sd-jwt/present';
import { PresentationFrame } from '@sd-jwt/types';
import { Uint8ArrayToBase64Url } from '@sd-jwt/utils';
import {
  Hasher,
  SdJwtDecodedDisclosure,
  SdJwtDecodedVerifiableCredential,
  SdJwtDecodedVerifiableCredentialPayload,
  SdJwtPresentationFrame,
} from '@sphereon/ssi-types';

import { ObjectUtils } from './ObjectUtils';

export function calculateSdHash(compactSdJwtVc: string, alg: string, hasher: Hasher): string {
  const digest = hasher(compactSdJwtVc, alg);
  return Uint8ArrayToBase64Url(digest);
}

/**
 * Applies the presentation frame to the decoded sd-jwt vc and will update the
 * `decodedPayload`, `compactSdJwt` and `disclosures` properties.
 *
 * Both the input and output interfaces of this method are defined in `@sphereon/ssi-types`, so
 * this method hides the actual implementation of SD-JWT (which is currently based on @sd-jwt/*)
 */
export function applySdJwtLimitDisclosure(
  sdJwtDecodedVerifiableCredential: SdJwtDecodedVerifiableCredential,
  presentationFrame: SdJwtPresentationFrame,
) {
  const SerializedDisclosures = sdJwtDecodedVerifiableCredential.disclosures.map((d) => ({
    digest: d.digest,
    encoded: d.encoded,
    salt: d.decoded[0],
    value: d.decoded.length === 3 ? d.decoded[2] : d.decoded[1],
    key: d.decoded.length === 3 ? d.decoded[1] : undefined,
  }));

  const requiredDisclosures = selectDisclosures(
    ObjectUtils.cloneDeep(sdJwtDecodedVerifiableCredential.signedPayload),
    // Map to sd-jwt disclosure format
    SerializedDisclosures,
    presentationFrame as PresentationFrame<Record<string, unknown>>,
  );

  sdJwtDecodedVerifiableCredential.disclosures = requiredDisclosures.map((d) => ({
    encoded: d.encoded,
    decoded: (d.key ? [d.salt, d.key, d.value] : [d.salt, d.value]) as SdJwtDecodedDisclosure,
    digest: d.digest,
  }));

  const includedDisclosures = sdJwtDecodedVerifiableCredential.disclosures.map((d) => d.encoded);
  const sdJwtParts = sdJwtDecodedVerifiableCredential.compactSdJwtVc.split('~');

  sdJwtDecodedVerifiableCredential.compactSdJwtVc = sdJwtParts
    // We want to keep first item (sd-jwt), last item (kb-jwt) and the digests
    .filter((item, index) => index === 0 || index === sdJwtParts.length - 1 || includedDisclosures.includes(item))
    .join('~');

  const { payload } = getSDAlgAndPayload(ObjectUtils.cloneDeep(sdJwtDecodedVerifiableCredential.signedPayload));
  const disclosureHashMap = createHashMappingForSerializedDisclosure(requiredDisclosures);
  const { unpackedObj: decodedPayload } = unpackObj(payload, disclosureHashMap);

  // Update the decoded / 'pretty' payload
  sdJwtDecodedVerifiableCredential.decodedPayload = decodedPayload as SdJwtDecodedVerifiableCredentialPayload;
}
