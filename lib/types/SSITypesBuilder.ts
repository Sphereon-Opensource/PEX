import { PresentationDefinitionV1 as PdV1, PresentationDefinitionV2 as PdV2 } from '@sphereon/pex-models';
import {
  AdditionalClaims,
  CompactJWT,
  ICredential,
  ICredentialSubject,
  IPresentation,
  IVerifiableCredential,
  IVerifiablePresentation,
  JwtDecodedVerifiableCredential,
  JwtDecodedVerifiablePresentation,
  OriginalType,
  OriginalVerifiableCredential,
  OriginalVerifiablePresentation,
  PresentationFormat,
  WrappedVerifiableCredential,
  WrappedVerifiablePresentation,
} from '@sphereon/ssi-types';
import jwt_decode from 'jwt-decode';

import { JsonPathUtils, ObjectUtils } from '../utils';

import {
  InternalPresentationDefinitionV1,
  InternalPresentationDefinitionV2,
  IPresentationDefinition,
} from './Internal.types';

export class SSITypesBuilder {
  public static createInternalPresentationDefinitionV1FromModelEntity(p: PdV1): InternalPresentationDefinitionV1 {
    const pd: PdV1 = SSITypesBuilder.createCopyAndModifyPresentationDefinition(p) as PdV1;
    return new InternalPresentationDefinitionV1(
      pd.id,
      pd.input_descriptors,
      pd.format,
      pd.name,
      pd.purpose,
      pd.submission_requirements
    );
  }

  public static createInternalPresentationDefinitionV2FromModelEntity(p: PdV2): InternalPresentationDefinitionV2 {
    const pd: PdV2 = SSITypesBuilder.createCopyAndModifyPresentationDefinition(p);
    return new InternalPresentationDefinitionV2(
      pd.id,
      pd.input_descriptors,
      pd.format,
      pd.frame,
      pd.name,
      pd.purpose,
      pd.submission_requirements
    );
  }

  static createCopyAndModifyPresentationDefinition(p: IPresentationDefinition): IPresentationDefinition {
    const pd: IPresentationDefinition = JSON.parse(JSON.stringify(p));
    JsonPathUtils.changePropertyNameRecursively(pd, '_const', 'const');
    JsonPathUtils.changePropertyNameRecursively(pd, '_enum', 'enum');
    JsonPathUtils.changeSpecialPathsRecursively(pd);
    return pd;
  }

  static mapExternalVerifiablePresentationToWrappedVP(
    presentation: OriginalVerifiablePresentation
  ): WrappedVerifiablePresentation {
    const isJwtEncoded: boolean = ObjectUtils.isString(presentation);
    const type: OriginalType = isJwtEncoded
      ? OriginalType.JWT_ENCODED
      : this.isJwtDecodedPresentation(presentation)
      ? OriginalType.JWT_DECODED
      : OriginalType.JSONLD;
    let vp = isJwtEncoded ? this.decodeJwtVerifiablePresentation(presentation as CompactJWT) : presentation;
    vp = this.isJwtDecodedPresentation(vp as OriginalVerifiablePresentation)
      ? this.createInternalPresentationFromJwtDecoded(vp as JwtDecodedVerifiablePresentation)
      : vp;
    const vcs: WrappedVerifiableCredential[] = this.mapExternalVerifiableCredentialsToWrappedVcs(
      (vp as IPresentation).verifiableCredential
    );
    const format: PresentationFormat =
      type === OriginalType.JWT_ENCODED || type === OriginalType.JWT_DECODED ? 'jwt' : 'ldp';
    return {
      format: format,
      type: type,
      original: presentation,
      decoded: isJwtEncoded
        ? (jwt_decode(presentation as string) as JwtDecodedVerifiablePresentation)
        : (presentation as IVerifiablePresentation),
      presentation: {
        '@context': (<IVerifiablePresentation>vp)['@context'],
        type: (<IVerifiablePresentation>vp).type,
        holder: (<IVerifiablePresentation>vp).holder,
        presentation_submission: (<IVerifiablePresentation>vp).presentation_submission,
        verifiableCredential: vcs,
      },
      vcs: vcs,
    };
  }

  private static decodeJwtVerifiablePresentation(jwtvp: string): IPresentation {
    const externalPresentationJwt: JwtDecodedVerifiablePresentation = jwt_decode(jwtvp as unknown as string);
    return {
      ...externalPresentationJwt.vp,
      expirationDate: externalPresentationJwt.exp,
      holder: externalPresentationJwt.iss,
      issuanceDate: externalPresentationJwt.nbf,
      id: externalPresentationJwt.jti,
    } as unknown as IPresentation;
  }

  static mapExternalVerifiableCredentialsToWrappedVcs(
    verifiableCredentials: OriginalVerifiableCredential[]
  ): WrappedVerifiableCredential[] {
    const wrappedVcs: WrappedVerifiableCredential[] = [];
    for (let i = 0; i < verifiableCredentials.length; i++) {
      wrappedVcs.push(this.mapExternalVerifiableCredentialToWrappedVc(verifiableCredentials[i]));
    }
    return wrappedVcs;
  }

  private static mapExternalVerifiableCredentialToWrappedVc(
    verifiableCredential: OriginalVerifiableCredential
  ): WrappedVerifiableCredential {
    if (ObjectUtils.isString(verifiableCredential)) {
      const externalCredentialJwt: JwtDecodedVerifiableCredential = jwt_decode(<CompactJWT>verifiableCredential);
      this.createInternalCredentialFromJwtDecoded(externalCredentialJwt);
      return {
        format: 'jwt',
        original: verifiableCredential,
        decoded: jwt_decode(verifiableCredential as unknown as string),
        type: OriginalType.JWT_ENCODED,
        credential: this.createInternalCredentialFromJwtDecoded(externalCredentialJwt),
      };
    } else if (this.isJwtDecodedCredential(verifiableCredential)) {
      return {
        format: 'jwt',
        original: verifiableCredential,
        decoded: verifiableCredential as JwtDecodedVerifiableCredential,
        type: OriginalType.JWT_DECODED,
        credential: this.createInternalCredentialFromJwtDecoded(
          verifiableCredential as unknown as JwtDecodedVerifiableCredential
        ),
      };
    } else {
      return {
        format: 'ldp',
        original: verifiableCredential,
        decoded: verifiableCredential as IVerifiableCredential,
        type: OriginalType.JSONLD,
        credential: verifiableCredential as ICredential,
      };
    }
  }

  private static createInternalCredentialFromJwtDecoded(
    externalCredentialJwt: JwtDecodedVerifiableCredential
  ): ICredential {
    const internalCredential: ICredential = {
      ...(externalCredentialJwt.vc as ICredential),
    };
    if (externalCredentialJwt.exp) {
      //TODO ESSIFI-186
      const expDate = (internalCredential.credentialSubject as ICredentialSubject & AdditionalClaims)?.expirationDate;
      const jwtExp = parseInt(externalCredentialJwt.exp.toString());
      // fix seconds to millisecs for the date
      const expAsDateStr =
        jwtExp < 9999999999
          ? new Date(jwtExp * 1000).toISOString().replace(/\.000Z/, 'Z')
          : new Date(jwtExp).toISOString();
      if (expDate && expDate !== expAsDateStr) {
        throw new Error(`Inconsistent expiration dates between JWT claim (${expAsDateStr}) and VC value (${expDate})`);
      }
      //TODO ESSIFI-186
      (internalCredential.credentialSubject as ICredentialSubject & AdditionalClaims).expirationDate = expAsDateStr;
    }

    if (externalCredentialJwt.nbf) {
      const issuanceDate = internalCredential.issuanceDate;
      const jwtNbf = parseInt(externalCredentialJwt.nbf.toString());
      // fix seconds to millisecs for the date
      const nbfAsDateStr =
        jwtNbf < 9999999999
          ? new Date(jwtNbf * 1000).toISOString().replace(/\.000Z/, 'Z')
          : new Date(jwtNbf).toISOString();
      if (issuanceDate && issuanceDate !== nbfAsDateStr) {
        throw new Error(
          `Inconsistent issuance dates between JWT claim (${nbfAsDateStr}) and VC value (${issuanceDate})`
        );
      }
      internalCredential.issuanceDate = nbfAsDateStr;
    }

    if (externalCredentialJwt.iss) {
      const issuer = internalCredential.issuer;
      if (issuer) {
        if (typeof issuer === 'string') {
          if (issuer !== externalCredentialJwt.iss) {
            throw new Error(
              `Inconsistent issuers between JWT claim (${externalCredentialJwt.iss}) and VC value (${issuer})`
            );
          }
        } else {
          if (issuer.id !== externalCredentialJwt.iss) {
            throw new Error(
              `Inconsistent issuers between JWT claim (${externalCredentialJwt.iss}) and VC value (${issuer.id})`
            );
          }
        }
      }
      internalCredential.issuer = externalCredentialJwt.iss;
    }

    if (externalCredentialJwt.sub) {
      //TODO ESSIFI-186
      const csId = (internalCredential.credentialSubject as ICredentialSubject)?.id;
      if (csId && csId !== externalCredentialJwt.sub) {
        throw new Error(
          `Inconsistent credential subject ids between JWT claim (${externalCredentialJwt.sub}) and VC value (${csId})`
        );
      }
      //TODO ESSIFI-186
      (internalCredential.credentialSubject as ICredentialSubject).id = externalCredentialJwt.sub;
    }
    if (externalCredentialJwt.jti) {
      const id = internalCredential.id;
      if (id && id !== externalCredentialJwt.jti) {
        throw new Error(
          `Inconsistent credential ids between JWT claim (${externalCredentialJwt.jti}) and VC value (${id})`
        );
      }
      internalCredential.id = externalCredentialJwt.jti;
    }
    return internalCredential;
  }

  private static isJwtDecodedCredential(verifiableCredential: OriginalVerifiableCredential) {
    return (
      (<JwtDecodedVerifiableCredential>verifiableCredential)['vc'] &&
      (<JwtDecodedVerifiableCredential>verifiableCredential)['iss']
    );
  }

  private static isJwtDecodedPresentation(verifiablePresentation: OriginalVerifiablePresentation) {
    return (
      (<JwtDecodedVerifiablePresentation>verifiablePresentation)['vp'] &&
      (<JwtDecodedVerifiablePresentation>verifiablePresentation)['iss']
    );
  }

  private static createInternalPresentationFromJwtDecoded(jwtVP: JwtDecodedVerifiablePresentation): IPresentation {
    const presentation: IPresentation = {
      ...(jwtVP.vp as IPresentation),
    };

    if (jwtVP.iss) {
      const holder = presentation.holder;
      if (holder) {
        if (holder !== jwtVP.iss) {
          throw new Error(`Inconsistent holders between JWT claim (${jwtVP.iss}) and VC value (${holder})`);
        }
      }
      presentation.holder = jwtVP.iss;
    }
    return presentation;
  }
}
