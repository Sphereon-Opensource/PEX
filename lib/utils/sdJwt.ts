import { Disclosure, SdJwtVc } from '@sd-jwt/core';
import { getDisclosuresForPresentationFrame } from '@sd-jwt/core/build/sdJwt';
import { swapClaims } from '@sd-jwt/core/build/sdJwt/swapClaim';
import { PresentationFrame } from '@sd-jwt/core/build/types/present';
import {
  SdJwtDecodedDisclosure,
  SdJwtDecodedVerifiableCredential,
  SdJwtDecodedVerifiableCredentialPayload,
  SdJwtPresentationFrame,
} from '@sphereon/ssi-types';

/**
 * Decode an SD-JWT vc from its compact format (string) to an object containing the disclosures,
 * signed payload, decoded payload and the compact SD-JWT vc.
 *
 * Both the input and output interfaces of this method are defined in `@sphereon/ssi-types`, so
 * this method hides the actual implementation of SD-JWT (which is currently based on @sd-jwt/core)
 */
export async function decodeSdJwtVc(
  compactSdJwtVc: string,
  { hasher }: { hasher: (data: string, alg: string) => Promise<Uint8Array> },
): Promise<SdJwtDecodedVerifiableCredential> {
  const sdJwtVc = SdJwtVc.fromCompact(compactSdJwtVc);

  // Default (should be handled by the sd-jwt library)
  let sdAlg = 'sha-256';
  try {
    sdAlg = sdJwtVc.getClaimInPayload('_sd_alg');
  } catch {
    /* no-op */
  }

  sdJwtVc.withHasher({
    algorithm: sdAlg,
    hasher: (data) => hasher(data, sdAlg),
  });

  const disclosuresWithDigests = (await sdJwtVc.disclosuresWithDigest()) ?? [];

  return {
    compactSdJwtVc: compactSdJwtVc,
    decodedPayload: await sdJwtVc.getPrettyClaims(),
    disclosures: disclosuresWithDigests.map((d) => ({
      decoded: d.decoded as SdJwtDecodedDisclosure,
      digest: d.digest,
      encoded: d.encoded,
    })),
    signedPayload: sdJwtVc.payload as SdJwtDecodedVerifiableCredentialPayload,
  };
}

/**
 * Applies the presentation frame to the decoded sd-jwt vc and will update the
 * `decodedPayload`, `compactSdJwt` and `disclosures` properties.
 *
 * Both the input and output interfaces of this method are defined in `@sphereon/ssi-types`, so
 * this method hides the actual implementation of SD-JWT (which is currently based on @sd-jwt/core)
 */
export async function applySdJwtLimitDisclosure(
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

  // NOTE: any way we can prevent mapping twice?
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
