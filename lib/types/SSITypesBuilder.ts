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

  static mapExternalVerifiablePresentationToWrappedVP(presentationCopy: IPresentation): WrappedVerifiablePresentation {
    const isjwtEncoded: boolean = ObjectUtils.isString(presentationCopy);
    const type: VerifiableDataExchangeType = isjwtEncoded
      ? VerifiableDataExchangeType.JWT_ENCODED
      : VerifiableDataExchangeType.JSONLD;
    const vp = isjwtEncoded
      ? this.decodeJwtVerifiablePresentation(presentationCopy as unknown as string)
      : presentationCopy;

    return {
      type: type,
      original: presentationCopy as IVerifiablePresentation,
      decoded: isjwtEncoded
        ? (jwt_decode(presentationCopy as unknown as string) as JwtWrappedVerifiablePresentation)
        : (presentationCopy as IVerifiablePresentation),
      vcs: this.mapExternalVerifiableCredentialsToWrappedVcs(vp.verifiableCredential),
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
    verifiableCredentials: IVerifiableCredential[]
  ): WrappedVerifiableCredential[] {
    const wrappedVcs: WrappedVerifiableCredential[] = [];
    for (let i = 0; i < verifiableCredentials.length; i++) {
      wrappedVcs.push(this.mapExternalVerifiableCredentialToWrappedVc(verifiableCredentials[i]));
    }
    return wrappedVcs;
  }

  private static mapExternalVerifiableCredentialToWrappedVc(
    verifiableCredential: IVerifiableCredential
  ): WrappedVerifiableCredential {
    if (ObjectUtils.isString(verifiableCredential)) {
      const externalCredentialJwt: JwtWrappedVerifiableCredential = jwt_decode(
        verifiableCredential as unknown as string
      );
      this.createInternalCredentialFromJwtDecoded(externalCredentialJwt);
      return {
        original: verifiableCredential,
        decoded: jwt_decode(verifiableCredential as unknown as string),
        type: VerifiableDataExchangeType.JWT_ENCODED,
        internalCredential: this.createInternalCredentialFromJwtDecoded(externalCredentialJwt),
      };
    } else if (this.isJwtDecoded(verifiableCredential)) {
      return {
        original: verifiableCredential,
        decoded: verifiableCredential,
        type: VerifiableDataExchangeType.JWT_DECODED,
        internalCredential: this.createInternalCredentialFromJwtDecoded(
          verifiableCredential as unknown as JwtWrappedVerifiableCredential
        ),
      };
    } else {
      return {
        original: verifiableCredential,
        decoded: verifiableCredential,
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

  private static isJwtDecoded(verifiableCredential: IVerifiableCredential) {
    return (
      verifiableCredential['vc' as keyof IVerifiableCredential] &&
      verifiableCredential['iss' as keyof IVerifiableCredential]
    );
  }
}
