import fs from 'fs';

import { PresentationDefinition } from '@sphereon/pe-models';

import {
  EvaluationClient,
  EvaluationHandler,
  SameSubjectEvaluationHandler,
  VP,
} from '../../lib';
import { Wallet } from '../../lib/evaluation/core/wallet';
import {Presentation} from "../../lib/verifiablePresentation/models";

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const wallet: Wallet = { 
  data: { 
    holder: { 
      did: 'did:example:ebfeb1f712ebc6f1c276e12ec21'
    } 
  }
};

describe('sameSubjectEvaluationHandler', () => {

  it('Should record as success when the fields requiring same subject belong to same subjects', () => {
    const pd: PresentationDefinition = getFile('./test/resources/pd_require_same_subject.json').presentation_definition;
    const presentation: Presentation = getFile('./test/resources/vp_require_same_subject.json');
    const results = getFile('./test/resources/sameSubjectEvaluationResults.json');

    const vp: VP = new VP(presentation);
    const evaluationHandler: EvaluationHandler = new SameSubjectEvaluationHandler(new EvaluationClient(wallet));
    evaluationHandler.handle(pd, vp as VP);
    expect(evaluationHandler.client.results).toEqual(results);
  });
});