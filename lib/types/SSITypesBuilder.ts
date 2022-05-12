import { PresentationDefinitionV1 as PdV1, PresentationDefinitionV2 as PdV2 } from '@sphereon/pex-models';
import jwt_decode from 'jwt-decode';

import { JsonPathUtils } from '../utils';
import { ObjectUtils } from '../utils/ObjectUtils';

import {
  InternalCredential,
  InternalPresentationDefinitionV1,
  InternalPresentationDefinitionV2,
  JwtWrappedVerifiableCredential,
  JwtWrappedVerifiablePresentation,
  VerifiableDataExchangeType,
  WrappedVerifiableCredential,
  WrappedVerifiablePresentation,
} from './Internal.types';
import { IPresentation, IPresentationDefinition, IVerifiableCredential, IVerifiablePresentation } from './SSI.types';

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
    presentation: IPresentation | JwtWrappedVerifiablePresentation | string
  ): WrappedVerifiablePresentation {
    const isJwtEncoded: boolean = ObjectUtils.isString(presentation);
    const type: VerifiableDataExchangeType = isJwtEncoded
      ? VerifiableDataExchangeType.JWT_ENCODED
      : VerifiableDataExchangeType.JSONLD;
    let vp = isJwtEncoded ? this.decodeJwtVerifiablePresentation(presentation as string) : presentation;
    vp = this.isJwtDecodedPresentation(vp)
      ? this.createInternalPresentationFromJwtDecoded(vp as JwtWrappedVerifiablePresentation)
      : vp;
    const vcs: WrappedVerifiableCredential[] = this.mapExternalVerifiableCredentialsToWrappedVcs(
      (vp as IPresentation).verifiableCredential
    );
    return {
      type: type,
      original: presentation as IVerifiablePresentation,
      decoded: isJwtEncoded
        ? (jwt_decode(presentation as string) as JwtWrappedVerifiablePresentation)
        : (presentation as IVerifiablePresentation),
      internalPresentation: {
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
    const externalPresentationJwt: JwtWrappedVerifiablePresentation = jwt_decode(jwtvp as unknown as string);
    return {
      ...externalPresentationJwt.vp,
      expirationDate: externalPresentationJwt.exp,
      holder: externalPresentationJwt.iss,
      issuanceDate: externalPresentationJwt.nbf,
      id: externalPresentationJwt.jti,
    } as unknown as IPresentation;
  }

  static mapExternalVerifiableCredentialsToWrappedVcs(
    verifiableCredentials: (IVerifiableCredential | JwtWrappedVerifiableCredential | string)[]
  ): WrappedVerifiableCredential[] {
    const wrappedVcs: WrappedVerifiableCredential[] = [];
    for (let i = 0; i < verifiableCredentials.length; i++) {
      wrappedVcs.push(this.mapExternalVerifiableCredentialToWrappedVc(verifiableCredentials[i]));
    }
    return wrappedVcs;
  }

  private static mapExternalVerifiableCredentialToWrappedVc(
    verifiableCredential: IVerifiableCredential | JwtWrappedVerifiableCredential | string
  ): WrappedVerifiableCredential {
    if (ObjectUtils.isString(verifiableCredential)) {
      const externalCredentialJwt: JwtWrappedVerifiableCredential = jwt_decode(<string>verifiableCredential);
      this.createInternalCredentialFromJwtDecoded(externalCredentialJwt);
      return {
        original: verifiableCredential,
        decoded: jwt_decode(verifiableCredential as unknown as string),
        type: VerifiableDataExchangeType.JWT_ENCODED,
        internalCredential: this.createInternalCredentialFromJwtDecoded(externalCredentialJwt),
      };
    } else if (this.isJwtDecodedCredential(verifiableCredential)) {
      return {
        original: verifiableCredential,
        decoded: verifiableCredential as JwtWrappedVerifiableCredential,
        type: VerifiableDataExchangeType.JWT_DECODED,
        internalCredential: this.createInternalCredentialFromJwtDecoded(
          verifiableCredential as unknown as JwtWrappedVerifiableCredential
        ),
      };
    } else {
      return {
        original: verifiableCredential,
        decoded: verifiableCredential as IVerifiableCredential,
        type: VerifiableDataExchangeType.JSONLD,
        internalCredential: verifiableCredential as InternalCredential,
      };
    }
  }

  private static createInternalCredentialFromJwtDecoded(
    externalCredentialJwt: JwtWrappedVerifiableCredential
  ): InternalCredential {
    const internalCredential: InternalCredential = {
      ...(externalCredentialJwt.vc as InternalCredential),
    };
    if (externalCredentialJwt.exp) {
      const expDate = internalCredential.credentialSubject?.expirationDate;
      const jwtExp = parseInt(externalCredentialJwt.exp.toString());
      // fix seconds to millisecs for the date
      const expAsDateStr =
        jwtExp < 9999999999
          ? new Date(jwtExp * 1000).toISOString().replace(/\.000Z/, 'Z')
          : new Date(jwtExp).toISOString();
      if (expDate && expDate !== expAsDateStr) {
        throw new Error(`Inconsistent expiration dates between JWT claim (${expAsDateStr}) and VC value (${expDate})`);
      }
      internalCredential.credentialSubject.expirationDate = expAsDateStr;
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
      const csId = internalCredential.credentialSubject?.id;
      if (csId && csId !== externalCredentialJwt.sub) {
        throw new Error(
          `Inconsistent credential subject ids between JWT claim (${externalCredentialJwt.sub}) and VC value (${csId})`
        );
      }
      internalCredential.credentialSubject.id = externalCredentialJwt.sub;
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

  private static isJwtDecodedCredential(
    verifiableCredential: IVerifiableCredential | JwtWrappedVerifiableCredential | string
  ) {
    return (
      (<JwtWrappedVerifiableCredential>verifiableCredential)['vc'] &&
      (<JwtWrappedVerifiableCredential>verifiableCredential)['iss']
    );
  }

  private static isJwtDecodedPresentation(
    verifiablePresentation: IPresentation | JwtWrappedVerifiablePresentation | string
  ) {
    return (
      (<JwtWrappedVerifiablePresentation>verifiablePresentation)['vp'] &&
      (<JwtWrappedVerifiablePresentation>verifiablePresentation)['iss']
    );
  }

  private static createInternalPresentationFromJwtDecoded(jwtVP: JwtWrappedVerifiablePresentation): IPresentation {
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
