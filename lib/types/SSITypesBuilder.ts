import { PresentationDefinitionV1 as PdV1, PresentationDefinitionV2 as PdV2 } from '@sphereon/pex-models';

import {
  InternalPresentationDefinitionV1,
  InternalPresentationDefinitionV2,
  InternalVerifiableCredential,
  InternalVerifiableCredentialJsonLD,
  InternalVerifiableCredentialJwt,
} from './Internal.types';
import { IHasProof, IJwtCredential, IVerifiableCredential } from './SSI.types';

export class SSITypesBuilder {
  public static createInternalPresentationDefinitionV1FromModelEntity(p: PdV1): InternalPresentationDefinitionV1 {
    return new InternalPresentationDefinitionV1(
      p.id,
      p.input_descriptors,
      p.format,
      p.name,
      p.purpose,
      p.submission_requirements
    );
  }

  public static createInternalPresentationDefinitionV2FromModelEntity(p: PdV2): InternalPresentationDefinitionV2 {
    return new InternalPresentationDefinitionV2(
      p.id,
      p.input_descriptors,
      p.format,
      p.frame,
      p.name,
      p.purpose,
      p.submission_requirements
    );
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
      if (expDate && expDate !== result.exp) {
        throw new Error(`Inconsistent expiration dates between JWT claim (${result.exp}) and VC value (${expDate})`);
      }
      const exp = result.exp.match(/^\d+$/) ? parseInt(result.exp) : result.exp;
      result.getBaseCredential().credentialSubject.expirationDate = new Date(exp).toISOString();
    }
    if (result.iss) {
      const issuer = result.getBaseCredential().issuer;
      if (issuer && issuer !== result.iss) {
        throw new Error(`Inconsistent issuers between JWT claim (${result.iss}) and VC value (${issuer})`);
      }
      result.getBaseCredential().issuer = result.iss;
    }
    if (result.nbf) {
      const issuanceDate = result.getBaseCredential().issuanceDate;
      if (issuanceDate && issuanceDate !== result.nbf) {
        throw new Error(`Inconsistent issuance dates between JWT claim (${result.nbf}) and VC value (${issuanceDate})`);
      }
      const nbf = result.nbf.match(/^\d+$/) ? parseInt(result.nbf) : result.nbf;
      result.getBaseCredential().issuanceDate = new Date(nbf).toISOString();
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
