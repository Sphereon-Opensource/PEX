import fs from 'fs';

import { PresentationSubmission } from '@sphereon/pex-models';
import { IVerifiableCredential, IVerifiablePresentation, OriginalType, WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Status } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation';
import { FormatRestrictionEvaluationHandler } from '../../lib/evaluation/handlers';
import { InternalPresentationDefinitionV1, SSITypesBuilder } from '../../lib/types';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {
  it('should return ok if no format restrictions are present', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.presentationSubmission = vpSimple.presentation_submission as PresentationSubmission;
    const evaluationHandler = new FormatRestrictionEvaluationHandler(evaluationClient);
    const wvc: WrappedVerifiableCredential = {
      credential: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      decoded: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      format: 'ldp',
      original: vpSimple.verifiableCredential![0],
      type: OriginalType.JSONLD,
    };
    evaluationHandler.handle(pd, [wvc]);
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return ok if matching format restrictions are present', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.presentationSubmission = vpSimple.presentation_submission as PresentationSubmission;
    /*const evaluationHandler = */
    new FormatRestrictionEvaluationHandler(evaluationClient);
    const wvc: WrappedVerifiableCredential = {
      credential: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      decoded: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      format: 'ldp',
      original: vpSimple.verifiableCredential![0],
      type: OriginalType.JSONLD,
    };
    evaluationClient.evaluate(pd, [wvc], {
      restrictToFormats: {
        jwt: {
          alg: [],
        },
        ldp: {
          proof_type: [],
        },
      },
    });
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return error if no matching format restrictions are present', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-age-predicate.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-age-predicate.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.presentationSubmission = vpSimple.presentation_submission as PresentationSubmission;
    /*const evaluationHandler = */
    new FormatRestrictionEvaluationHandler(evaluationClient);
    const wvc: WrappedVerifiableCredential = {
      credential: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      decoded: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      format: 'ldp',
      original: vpSimple.verifiableCredential![0],
      type: OriginalType.JSONLD,
    };
    evaluationClient.evaluate(pd, [wvc], {
      restrictToFormats: {
        jwt: {
          alg: [],
        },
        ldp_vp: {
          proof_type: [],
        },
      },
    });
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults).toHaveLength(2);
  });
});
