import { PresentationDefinitionV1 as PdV1, PresentationDefinitionV2 as PdV2 } from '@sphereon/pe-models';

import { PresentationDefinitionV1, PresentationDefinitionV2 } from './SSI.types';

export class SSITypesBuilder {
  public static createInternalPresentationDefinitionV1FromModelEntity(p: PdV1): PresentationDefinitionV1 {
    return new PresentationDefinitionV1(
      p.id,
      p.input_descriptors,
      p.format,
      p.name,
      p.purpose,
      p.submission_requirements
    );
  }

  public static createInternalPresentationDefinitionV2FromModelEntity(p: PdV2): PresentationDefinitionV2 {
    return new PresentationDefinitionV2(
      p.id,
      p.input_descriptors,
      p.format,
      p.frame,
      p.name,
      p.purpose,
      p.submission_requirements
    );
  }
}
