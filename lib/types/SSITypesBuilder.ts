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

  private static setJWTAdditionalFields(
    result: InternalVerifiableCredentialJwt & IJwtCredential & IHasProof
  ): InternalVerifiableCredentialJwt & IJwtCredential & IHasProof {
    if (result.exp) {
      if (result.getBaseCredential().credentialSubject?.expirationDate !== result.exp) {
        throw new Error('Inconsistent expiration dates');
      }
      result.getBaseCredential().credentialSubject.expirationDate = new Date(
        result.exp as string | number | Date
      ).toISOString();
    }
    if (result.iss) {
      if (result.getBaseCredential().issuer !== result.iss) {
        throw new Error('Inconsistent issuers');
      }
      result.getBaseCredential().issuer = result.iss;
    }
    if (result.nbf) {
      if (result.getBaseCredential().issuanceDate !== result.nbf) {
        throw new Error('Inconsistent issuance dates');
      }
      result.getBaseCredential().issuanceDate = new Date(result.nbf as string | number | Date).toISOString();
    }
    if (result.sub) {
      if (result.getBaseCredential().credentialSubject?.id !== result.sub) {
        throw new Error('Inconsistent credential subject ids');
      }
      result.getBaseCredential().credentialSubject.id = result.sub;
    }
    if (result.jti) {
      if (result.getBaseCredential().id !== result.jti) {
        throw new Error('Inconsistent credential ids');
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
