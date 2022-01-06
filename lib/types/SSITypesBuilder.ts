import { PresentationDefinitionV1 as PdV1, PresentationDefinitionV2 as PdV2 } from '@sphereon/pex-models';

import { JsonPathUtils } from '../utils';

import {
  InternalPresentationDefinitionV1,
  InternalPresentationDefinitionV2,
  InternalVerifiableCredential,
  InternalVerifiableCredentialJsonLD,
  InternalVerifiableCredentialJwt,
} from './Internal.types';
import { IPresentationDefinition, IVerifiableCredential } from './SSI.types';

export class SSITypesBuilder {
  public static createInternalPresentationDefinitionV1FromModelEntity(p: PdV1): InternalPresentationDefinitionV1 {
    const pd: PdV1 = SSITypesBuilder.createCopyAndChangePropertyName(p) as PdV1;
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
    const pd: PdV2 = SSITypesBuilder.createCopyAndChangePropertyName(p);
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
  static createCopyAndChangePropertyName(p: IPresentationDefinition): IPresentationDefinition {
    const pd: IPresentationDefinition = JSON.parse(JSON.stringify(p));
    JsonPathUtils.changePropertyNameRecursively(pd, '_const', 'const');
    JsonPathUtils.changePropertyNameRecursively(pd, '_enum', 'enum');
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
      return Object.assign(vc, externalCredential);
    } else if (externalCredential.credentialSubject && externalCredential.id) {
      const vc: InternalVerifiableCredential = new InternalVerifiableCredentialJsonLD();
      return Object.assign(vc, externalCredential);
    }
    throw 'VerifiableCredential structure is incorrect.';
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
