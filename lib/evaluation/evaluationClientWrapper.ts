import {
  Descriptor,
  PresentationDefinition,
  PresentationSubmission,
  Rules,
  SubmissionRequirement,
} from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';
import { VerifiablePresentation } from '../verifiablePresentation';

import { EvaluationClient } from './evaluationClient';
import { EvaluationResults } from './evaluationResults';
import { HandlerCheckResult } from './handlerCheckResult';

export class EvaluationClientWrapper {
  private _client: EvaluationClient;

  constructor() {
    this._client = new EvaluationClient();
  }

  public getEvaluationClient() {
    return this._client;
  }

  public evaluate(pd: PresentationDefinition, vp: VerifiablePresentation): EvaluationResults {
    this._client.evaluate(pd, vp);
    const result: any = {};
    result.warnings = this.formatNotInfo(Status.WARN);
    result.errors = this.formatNotInfo(Status.ERROR);
    if (this._client.verifiablePresentation.getPresentationSubmission().descriptor_map.length) {
      result.value = this._client.verifiablePresentation.getPresentationSubmission();
    }
    return result;
  }

  private formatNotInfo(status: Status): Checked[] {
    return this._client.results
      .filter((result) => result.status === status)
      .map((x) => {
        return {
          tag: x.evaluator,
          status: x.status,
          message: `${x.message}: ${x.input_descriptor_path}: ${x.verifiable_credential_path}`,
        };
      });
  }

  public submissionFrom(pd: PresentationDefinition, vcs: unknown[]): PresentationSubmission {
    if (!this._client.results) {
      throw Error('You need to call evaluate() before submissionFrom()');
    }

    if (pd.submission_requirements) {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) =>
          result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR
      );
      for (const submissionRequirement of pd.submission_requirements) {
        if (submissionRequirement.rule === Rules.All) {
          if (submissionRequirement.from) {
            this.handleAllFrom(submissionRequirement, marked);
          } else if (submissionRequirement.from_nested) {
            for (const sr of submissionRequirement.from_nested) {
              if (sr.rule === Rules.All) {
                if (sr.from) {
                  this.handleAllFrom(sr, marked);
                }
              } else if (sr.rule === Rules.Pick) {
                this.handlePick(sr, marked);
              }
            }
          }
        } else if (submissionRequirement.rule === Rules.Pick) {
          this.handlePick(submissionRequirement, marked);
        } else {
          throw Error('Unsupported rule');
        }
      }
    }
    return this.remapVcs(vcs);
  }

  private remapVcs(vcs: unknown[]) {
    const presentationSubmission: PresentationSubmission = {
      ...this._client.verifiablePresentation.presentationSubmission,
    };
    const descriptorMap: Descriptor[] = [...this._client.verifiablePresentation.presentationSubmission.descriptor_map];
    for (const [i, vc] of this._client.verifiablePresentation.verifiableCredential.entries()) {
      for (const [j, newVc] of vcs.entries()) {
        for (const [h, descriptor] of descriptorMap.entries()) {
          if (vc == newVc && descriptor[h].path == `$.verifiablePresentation[${i}]`) {
            descriptorMap[h].path = `$.verifiablePresentation[${j}]`;
          }
        }
      }
    }
    presentationSubmission.descriptor_map = descriptorMap;
    return presentationSubmission;
  }

  private handleAllFrom(submissionRequirement: SubmissionRequirement, marked: HandlerCheckResult[]) {
    for (const m of marked) {
      if (m.payload.group !== submissionRequirement.from) {
        throw Error('group not present');
      }
    }
  }

  private handlePick(submissionRequirement: SubmissionRequirement, marked: HandlerCheckResult[]): void {
    let count = 0;
    if (submissionRequirement.from) {
      for (const m of marked) {
        if (m.payload.group === submissionRequirement.from) {
          count++;
        }
      }
      if (submissionRequirement.count) {
        if (count !== submissionRequirement.count) {
          throw Error(`Count: expected: ${submissionRequirement.count} actual: ${count}`);
        }
      } else if (submissionRequirement.min) {
        if (count < submissionRequirement.min) {
          throw Error(`Min: expected: ${submissionRequirement.min} actual: ${count}`);
        }
      }
      if (submissionRequirement.max) {
        if (count > submissionRequirement.max) {
          throw Error(`Max: expected: ${submissionRequirement.max} actual: ${count}`);
        }
      }
    }
  }
}
