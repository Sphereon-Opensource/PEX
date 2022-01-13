import { PresentationDefinitionV1 as PdV1, PresentationDefinitionV2 as PdV2 } from '@sphereon/pex-models';

import { JsonPathUtils } from '../utils';

import {
  InternalPresentationDefinitionV1,
  InternalPresentationDefinitionV2,
  InternalVerifiableCredential,
  InternalVerifiableCredentialJsonLD,
  InternalVerifiableCredentialJwt,
} from './Internal.types';
import { IHasProof, IJwtCredential, IPresentationDefinition, IVerifiableCredential } from './SSI.types';

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

  static mapExternalVerifiableCredentialsToInternal(
    externalCredentials: IVerifiableCredential[]
  ): InternalVerifiableCredential[] {
    const internalVCs: InternalVerifiableCredential[] = [];
    for (const externalCredential of externalCredentials) {
      internalVCs.push(this.mapExternalVerifiableCredentialToInternal(externalCredential));
    }
    return internalVCs;
  }

  private static mapExternalVerifiableCredentialToInternal(externalCredential: IVerifiableCredential) {
    if (externalCredential.vc && externalCredential.iss) {
      const vc: InternalVerifiableCredential = new InternalVerifiableCredentialJwt();
      const result = Object.assign(vc, externalCredential);
      return SSITypesBuilder.setJWTAdditionalFields(result);
    } else if (externalCredential.credentialSubject && externalCredential.id) {
      const vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
      return Object.assign(vc, externalCredential);
    }
    throw 'VerifiableCredential structure is incorrect.';
  }

  private static setJWTAdditionalFields(result: InternalVerifiableCredentialJwt & IJwtCredential & IHasProof) {
    if (result.exp) {
      const expDate = result.getBaseCredential().credentialSubject?.expirationDate;
      const jwtExp = parseInt(result.exp.toString());
      // fix seconds to millisecs for the date
      const expAsDateStr =
        jwtExp < 9999999999
          ? new Date(jwtExp * 1000).toISOString().replace(/\.000Z/, 'Z')
          : new Date(jwtExp).toISOString();
      if (expDate && expDate !== expAsDateStr) {
        throw new Error(`Inconsistent expiration dates between JWT claim (${expAsDateStr}) and VC value (${expDate})`);
      }
      result.getBaseCredential().credentialSubject.expirationDate = expAsDateStr;
    }

    if (result.nbf) {
      const issuanceDate = result.getBaseCredential().issuanceDate;
      const jwtNbf = parseInt(result.nbf.toString());
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
      result.getBaseCredential().issuanceDate = nbfAsDateStr;
    }

    if (result.iss) {
      const issuer = result.getBaseCredential().issuer;
      if (issuer) {
        if (typeof issuer === 'string') {
          if (issuer !== result.iss) {
            throw new Error(`Inconsistent issuers between JWT claim (${result.iss}) and VC value (${issuer})`);
          }
        } else {
          if (issuer.id !== result.iss) {
            throw new Error(`Inconsistent issuers between JWT claim (${result.iss}) and VC value (${issuer.id})`);
          }
        }
      }
      result.getBaseCredential().issuer = result.iss;
    }

    if (result.sub) {
      const csId = result.getBaseCredential().credentialSubject?.id;
      if (csId && csId !== result.sub) {
        throw new Error(`Inconsistent credential subject ids between JWT claim (${result.sub}) and VC value (${csId})`);
      }
      result.getBaseCredential().credentialSubject.id = result.sub;
    }
    if (result.jti) {
      const id = result.getBaseCredential().id;
      if (id && id !== result.jti) {
        throw new Error(`Inconsistent credential ids between JWT claim (${result.jti}) and VC value (${id})`);
      }
      result.getBaseCredential().id = result.jti;
    }
    return result;
  }

  static mapInternalVerifiableCredentialsToExternal(
    internalCredentials: InternalVerifiableCredential[]
  ): IVerifiableCredential[] {
    const externalVCs: IVerifiableCredential[] = [];
    for (const internalCredential of internalCredentials) {
      externalVCs.push(this.mapInternalVerifiableCredentialToExternal(internalCredential));
    }
    return externalVCs;
  }

  private static mapInternalVerifiableCredentialToExternal(
    internalCredential: InternalVerifiableCredential
  ): IVerifiableCredential {
    return internalCredential as IVerifiableCredential;
  }
}
