import { PresentationSubmission } from '@sphereon/pex-models';

export class SameSubjectPresentationSubmission {
  public getPresentationSubmission(): PresentationSubmission {
    return {
      id: 'MO8q9vLDoUiqtYAmI6IBL',
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9aaa',
          format: 'ldp_vc',
          path: '$.verifiableCredential[0]',
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9bbb',
          format: 'ldp_vc',
          path: '$.verifiableCredential[1]',
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9ccc',
          format: 'ldp_vc',
          path: '$.verifiableCredential[2]',
        },
        {
          id: '867bfe7a-5b91-46b2-9ba4-70028b8d9ddd',
          format: 'ldp_vc',
          path: '$.verifiableCredential[3]',
        },
      ],
    };
  }
}
