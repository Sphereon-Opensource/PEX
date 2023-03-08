import { PresentationDefinitionV1 as PdV1, PresentationDefinitionV2 as PdV2 } from '@sphereon/pex-models';
import {
  CredentialMapper,
  JwtDecodedVerifiablePresentation,
  OriginalVerifiableCredential,
  OriginalVerifiablePresentation,
  WrappedVerifiableCredential,
  WrappedVerifiablePresentation,
} from '@sphereon/ssi-types';

import { JsonPathUtils } from '../utils';

import { InternalPresentationDefinitionV1, InternalPresentationDefinitionV2, IPresentationDefinition } from './Internal.types';

export class SSITypesBuilder {
  public static createInternalPresentationDefinitionV1FromModelEntity(p: PdV1): InternalPresentationDefinitionV1 {
    const pd: PdV1 = SSITypesBuilder.createCopyAndModifyPresentationDefinition(p) as PdV1;
    return new InternalPresentationDefinitionV1(pd.id, pd.input_descriptors, pd.format, pd.name, pd.purpose, pd.submission_requirements);
  }

  public static createInternalPresentationDefinitionV2FromModelEntity(p: PdV2): InternalPresentationDefinitionV2 {
    const pd: PdV2 = SSITypesBuilder.createCopyAndModifyPresentationDefinition(p);
    return new InternalPresentationDefinitionV2(pd.id, pd.input_descriptors, pd.format, pd.frame, pd.name, pd.purpose, pd.submission_requirements);
  }

  static createCopyAndModifyPresentationDefinition(p: IPresentationDefinition): IPresentationDefinition {
    const pd: IPresentationDefinition = JSON.parse(JSON.stringify(p));
    JsonPathUtils.changePropertyNameRecursively(pd, '_const', 'const');
    JsonPathUtils.changePropertyNameRecursively(pd, '_enum', 'enum');
    JsonPathUtils.changeSpecialPathsRecursively(pd);
    return pd;
  }

  static mapExternalVerifiablePresentationToWrappedVP(
    presentation: OriginalVerifiablePresentation | JwtDecodedVerifiablePresentation
  ): WrappedVerifiablePresentation {
    return CredentialMapper.toWrappedVerifiablePresentation(presentation);
  }

  static mapExternalVerifiableCredentialsToWrappedVcs(
    verifiableCredentials: OriginalVerifiableCredential | OriginalVerifiableCredential[]
  ): WrappedVerifiableCredential[] {
    return CredentialMapper.toWrappedVerifiableCredentials(Array.isArray(verifiableCredentials) ? verifiableCredentials : [verifiableCredentials]);
  }
}
