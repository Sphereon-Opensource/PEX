export function getVpFormatForVcFormat(vcFormat: string) {
  if (vcFormat in vcVpFormatMap) {
    const vpFormat = vcVpFormatMap[vcFormat as keyof typeof vcVpFormatMap];

    let nestedCredentialPath: string | undefined = undefined;
    if (vpFormat === 'di_vp' || vpFormat === 'ldp_vp') {
      nestedCredentialPath = '$.verifiableCredential';
    } else if (vpFormat === 'jwt_vp' || vpFormat === 'jwt_vp_json') {
      nestedCredentialPath = '$.vp.verifiableCredential';
    }

    return {
      vpFormat,
      nestedCredentialPath,
    };
  }

  throw new Error(`Unrecognized vc format ${vcFormat}`);
}

const vcVpFormatMap = {
  di_vc: 'di_vp',
  jwt_vc_json: 'jwt_vp_json',
  ldp_vc: 'ldp_vp',
  jwt_vc: 'jwt_vp',
  'vc+sd-jwt': 'vc+sd-jwt',
} as const;
