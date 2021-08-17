import {
  Descriptor,
  PresentationDefinition,
  PresentationSubmission,
  Rules,
  SubmissionRequirement,
} from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';
import { SelectResults } from './core/selectResults';
import { SubmissionRequirementMatch } from './core/submissionRequirementMatch';

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

  public selectFrom(presentationDefinition: PresentationDefinition, selectedCredentials: unknown[]): SelectResults {
    this._client.evaluate(presentationDefinition, { verifiableCredential: selectedCredentials });

    const marked: HandlerCheckResult[] = this._client.results.filter(
      (result) =>
        result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR
    );
    this.evaluateRequirements(presentationDefinition.submission_requirements, marked, 0);
    return {
      matches: [...this.matchSubmissionRequirements(presentationDefinition.submission_requirements, marked)],
      warnings: [],
    };
  }

  private matchSubmissionRequirements(
    submissionRequirements: SubmissionRequirement[],
    marked: HandlerCheckResult[]
  ): SubmissionRequirementMatch[] {
    const submissionRequirementMatches: SubmissionRequirementMatch[] = [];
    for (const sr of submissionRequirements) {
      if (sr.from) {
        if (sr.rule === Rules.All) {
          submissionRequirementMatches.push(this.mapMatchingDescriptors(sr, marked));
        } else if (sr.rule === Rules.Pick) {
          submissionRequirementMatches.push(this.mapMatchingDescriptors(sr, marked));
        }
      } else if (sr.from_nested) {
        const srm = this.createSubmissionRequirementMatch(sr);
        srm.count++;
        srm.from_nested.push(...this.matchSubmissionRequirements(sr.from_nested, marked));
        submissionRequirementMatches.push(srm);
      }
    }
    return submissionRequirementMatches;
  }

  private mapMatchingDescriptors(sr: SubmissionRequirement, marked: HandlerCheckResult[]): SubmissionRequirementMatch {
    const srm = this.createSubmissionRequirementMatch(sr);
    if (!srm.from.includes(sr.from)) {
      srm.from.push(...sr.from);
    }
    for (const m of marked) {
      if (m.payload.group.includes(sr.from)) {
        srm.count++;
        srm.matches.push(m.verifiable_credential_path);
      }
    }
    return srm;
  }

  private createSubmissionRequirementMatch(sr: SubmissionRequirement): SubmissionRequirementMatch {
    if (sr.from) {
      return {
        rule: sr.rule,
        count: 0,
        matches: [],
        from: [],
        name: sr.name,
      };
    } else if (sr.from_nested) {
      return {
        rule: sr.rule,
        count: 0,
        matches: [],
        from_nested: [],
        name: sr.name,
      };
    }
    return null;
  }

  public evaluate(pd: PresentationDefinition, vp: unknown): EvaluationResults {
    this._client.evaluate(pd, vp);
    const result: any = {};
    result.warnings = this.formatNotInfo(Status.WARN);
    result.errors = this.formatNotInfo(Status.ERROR);
    if (this._client.verifiablePresentation['presentationSubmission']['descriptor_map'].length) {
      result.value = this._client.verifiablePresentation['presentationSubmission'];
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
      this.evaluateRequirements(pd.submission_requirements, marked, 0);
    }
    return this.remapVcs(vcs);
  }

  private evaluateRequirements(
    submissionRequirement: SubmissionRequirement[],
    marked: HandlerCheckResult[],
    level: number
  ): number {
    let total = 0;
    for (const sr of submissionRequirement) {
      if (sr.from) {
        if (sr.rule === Rules.All) {
          if (this.countMatchingInputDescriptors(sr, marked) !== marked.length) {
            throw Error(`Not all input descriptors are members of group ${sr.from}`);
          }
          total++;
        } else if (sr.rule === Rules.Pick) {
          const count = this.countMatchingInputDescriptors(sr, marked);
          try {
            this.handleCount(sr, count, level);
            total++;
          } catch (error) {
            if (level === 0) throw error;
          }
        }
      } else if (sr.from_nested) {
        const count = this.evaluateRequirements(sr.from_nested, marked, ++level);
        total += count;
        this.handleCount(sr, count, level);
      }
    }
    return total;
  }

  private countMatchingInputDescriptors(
    submissionRequirement: SubmissionRequirement,
    marked: HandlerCheckResult[]
  ): number {
    let count = 0;
    for (const m of marked) {
      if (m.payload.group.includes(submissionRequirement.from)) {
        count++;
      }
    }
    return count;
  }

  private handleCount(submissionRequirement: SubmissionRequirement, count: number, level: number): void {
    if (submissionRequirement.count) {
      if (count !== submissionRequirement.count) {
        throw Error(`Count: expected: ${submissionRequirement.count} actual: ${count} at level: ${level}`);
      }
    }
    if (submissionRequirement.min) {
      if (count < submissionRequirement.min) {
        throw Error(`Min: expected: ${submissionRequirement.min} actual: ${count} at level: ${level}`);
      }
    }
    if (submissionRequirement.max) {
      if (count > submissionRequirement.max) {
        throw Error(`Max: expected: ${submissionRequirement.max} actual: ${count} at level: ${level}`);
      }
    }
  }
  private remapVcs(vcs: unknown[]) {
    const presentationSubmission: PresentationSubmission = {
      ...this._client.verifiablePresentation.presentationSubmission,
    };
    const descriptorMap: Descriptor[] = [...this._client.verifiablePresentation.presentationSubmission.descriptor_map];
    for (const [i, vc] of this._client.verifiablePresentation.verifiableCredential.entries()) {
      for (const [j, newVc] of Object.entries(vcs)) {
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
}
