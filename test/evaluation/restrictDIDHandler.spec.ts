import fs from 'fs';

import { PresentationSubmission } from '@sphereon/pex-models';
import { IVerifiableCredential, IVerifiablePresentation, OriginalType, WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Status } from '../../lib';
import { EvaluationClient } from '../../lib/evaluation';
import { DIDRestrictionEvaluationHandler } from '../../lib/evaluation/handlers';
import { InternalPresentationDefinitionV1, SSITypesBuilder } from '../../lib/types';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

describe('evaluate', () => {
  it('should return ok if no DID restrictions are present', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-subject-is-issuer.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-subject-is-issuer.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.presentationSubmission = vpSimple.presentation_submission as PresentationSubmission;
    const evaluationHandler = new DIDRestrictionEvaluationHandler(evaluationClient);
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

  it('should return ok if matching DID restrictions are present', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-subject-is-issuer.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-subject-is-issuer.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.presentationSubmission = vpSimple.presentation_submission as PresentationSubmission;
    /*const evaluationHandler = */
    new DIDRestrictionEvaluationHandler(evaluationClient);
    const wvc: WrappedVerifiableCredential = {
      credential: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      decoded: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      format: 'ldp',
      original: vpSimple.verifiableCredential![0],
      type: OriginalType.JSONLD,
    };
    evaluationClient.evaluate(pd, [wvc], {
      restrictToDIDMethods: ['did:example'],
    });
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults.length).toEqual(0);
  });

  it('should return error if no matching DID restrictions are present', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile(
      './test/dif_pe_examples/pdV1/pd-simple-schema-subject-is-issuer.json',
    ).presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const vpSimple: IVerifiablePresentation = getFile('./test/dif_pe_examples/vp/vp-simple-subject-is-issuer.json');
    const evaluationClient: EvaluationClient = new EvaluationClient();
    evaluationClient.presentationSubmission = vpSimple.presentation_submission as PresentationSubmission;
    /*const evaluationHandler = */
    new DIDRestrictionEvaluationHandler(evaluationClient);
    const wvc: WrappedVerifiableCredential = {
      credential: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      decoded: vpSimple.verifiableCredential![0] as IVerifiableCredential,
      format: 'ldp',
      original: vpSimple.verifiableCredential![0],
      type: OriginalType.JSONLD,
    };
    evaluationClient.evaluate(pd, [wvc], {
      restrictToDIDMethods: ['did:nope'],
    });
    const errorResults = evaluationClient.results.filter((result) => result.status === Status.ERROR);
    expect(errorResults).toHaveLength(2);
  });
});
