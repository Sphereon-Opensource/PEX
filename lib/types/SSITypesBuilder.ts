import { PresentationDefinitionV1 as PdV1, PresentationDefinitionV2 as PdV2 } from '@sphereon/pex-models';

import { JsonPathUtils } from '../utils';

import {
  InternalPresentationDefinitionV1,
  InternalPresentationDefinitionV2,
  InternalVerifiableCredential,
  InternalVerifiableCredentialJsonLD,
  InternalVerifiableCredentialJwt,
} from './Internal.types';
import { IVerifiableCredential } from './SSI.types';

export class SSITypesBuilder {
  public static createInternalPresentationDefinitionV1FromModelEntity(p: PdV1): InternalPresentationDefinitionV1 {
    const presentationDefinitionCopy: PdV1 = JSON.parse(JSON.stringify(p));
    JsonPathUtils.changePropertyNameRecursively(presentationDefinitionCopy, '_const', 'const');
    JsonPathUtils.changePropertyNameRecursively(presentationDefinitionCopy, '_enum', 'enum');
    return new InternalPresentationDefinitionV1(
      presentationDefinitionCopy.id,
      presentationDefinitionCopy.input_descriptors,
      presentationDefinitionCopy.format,
      presentationDefinitionCopy.name,
      presentationDefinitionCopy.purpose,
      presentationDefinitionCopy.submission_requirements
    );
  }

  public static createInternalPresentationDefinitionV2FromModelEntity(p: PdV2): InternalPresentationDefinitionV2 {
    const presentationDefinitionCopy: PdV2 = JSON.parse(JSON.stringify(p));
    JsonPathUtils.changePropertyNameRecursively(p, '_const', 'const');
    JsonPathUtils.changePropertyNameRecursively(p, '_enum', 'enum');
    return new InternalPresentationDefinitionV2(
      presentationDefinitionCopy.id,
      presentationDefinitionCopy.input_descriptors,
      presentationDefinitionCopy.format,
      presentationDefinitionCopy.frame,
      presentationDefinitionCopy.name,
      presentationDefinitionCopy.purpose,
      presentationDefinitionCopy.submission_requirements
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
