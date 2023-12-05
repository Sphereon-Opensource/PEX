import { Disclosure } from '@sd-jwt/core';
import { Base64url } from '@sd-jwt/core/build/base64url';
import { getDisclosuresForPresentationFrame } from '@sd-jwt/core/build/sdJwt';
import { swapClaims } from '@sd-jwt/core/build/sdJwt/swapClaim';
import { PresentationFrame } from '@sd-jwt/core/build/types/present';
import {
  Hasher,
  SdJwtDecodedDisclosure,
  SdJwtDecodedVerifiableCredential,
  SdJwtDecodedVerifiableCredentialPayload,
  SdJwtPresentationFrame,
} from '@sphereon/ssi-types';

export function calculateSdHash(compactSdJwtVc: string, alg: string, hasher: Hasher): string {
  const digest = hasher(compactSdJwtVc, alg);
  return Base64url.encode(digest);
}

/**
 * Applies the presentation frame to the decoded sd-jwt vc and will update the
 * `decodedPayload`, `compactSdJwt` and `disclosures` properties.
 *
 * Both the input and output interfaces of this method are defined in `@sphereon/ssi-types`, so
 * this method hides the actual implementation of SD-JWT (which is currently based on @sd-jwt/core)
 */
export function applySdJwtLimitDisclosure(
  sdJwtDecodedVerifiableCredential: SdJwtDecodedVerifiableCredential,
  presentationFrame: SdJwtPresentationFrame,
) {
  const requiredDisclosures = getDisclosuresForPresentationFrame(
    sdJwtDecodedVerifiableCredential.signedPayload,
    presentationFrame as PresentationFrame<Record<string, unknown>>,
    sdJwtDecodedVerifiableCredential.decodedPayload,
    // Map to sd-jwt disclosure format
    sdJwtDecodedVerifiableCredential.disclosures.map((d) => Disclosure.fromString(d.encoded).withDigest(d.digest)),
  );

  sdJwtDecodedVerifiableCredential.disclosures = requiredDisclosures.map((d) => ({
    encoded: d.encoded,
    decoded: d.decoded as SdJwtDecodedDisclosure,
    digest: d.digest,
  }));

  const includedDisclosures = sdJwtDecodedVerifiableCredential.disclosures.map((d) => d.encoded);
  const sdJwtParts = sdJwtDecodedVerifiableCredential.compactSdJwtVc.split('~');

  sdJwtDecodedVerifiableCredential.compactSdJwtVc = sdJwtParts
    // We want to keep first item (sd-jwt), last item (kb-jwt) and the digests
    .filter((item, index) => index === 0 || index === sdJwtParts.length - 1 || includedDisclosures.includes(item))
    .join('~');

  // Update the decoded / 'pretty' payload
  sdJwtDecodedVerifiableCredential.decodedPayload = swapClaims(
    sdJwtDecodedVerifiableCredential.signedPayload,
    requiredDisclosures,
  ) as SdJwtDecodedVerifiableCredentialPayload;
}
