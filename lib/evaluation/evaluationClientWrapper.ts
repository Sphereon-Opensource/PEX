import {
  InputDescriptor,
  PresentationDefinition,
  PresentationSubmission,
  Rules,
  SubmissionRequirement,
} from '@sphereon/pe-models';

import { Checked, Status } from '../ConstraintUtils';
import { JsonPathUtils } from '../utils';
import { VerifiableCredential, VerifiablePresentation } from '../verifiablePresentation';

import { SelectResults, SubmissionRequirementMatch } from './core';
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

  public selectFrom(
    presentationDefinition: PresentationDefinition,
    selectableCredentials: VerifiableCredential[],
    did: string
  ): SelectResults {
    let selectResults: SelectResults;
    this._client.evaluate(presentationDefinition, {
      '@context': null,
      type: null,
      presentationSubmission: null,
      verifiableCredential: selectableCredentials,
      holder: did,
      proof: null,
    });
    const warnings: Checked[] = [...this.formatNotInfo(Status.WARN)];
    const errors: Checked[] = [...this.formatNotInfo(Status.ERROR)];
    if (presentationDefinition.submission_requirements) {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) =>
          result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR
      );
      const matchSubmissionRequirements = this.matchSubmissionRequirements(
        presentationDefinition.submission_requirements,
        marked
      );
      const vcs = this.extractVCIndexes(matchSubmissionRequirements).map(
        (i) => this._client.verifiablePresentation.verifiableCredential[i]
      );
      selectResults = {
        errors: marked.length > 0 ? [] : errors,
        matches: [...matchSubmissionRequirements],
        verifiableCredentials: vcs,
        warnings,
      };
    } else {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== Status.ERROR
      );

      selectResults = {
        errors: marked.length > 0 ? [] : errors,
        matches: [...this.matchWithoutSubmissionRequirements(marked, presentationDefinition)],
        verifiableCredentials: this._client.verifiablePresentation.verifiableCredential,
        warnings,
      };
    }

    return selectResults;
  }

  private extractVCIndexes(matchSubmissionRequirements: SubmissionRequirementMatch[]) {
    const matches = matchSubmissionRequirements.map((e) => e.matches);
    const matchesFlattened = [].concat(...matches);
    if (!matchesFlattened || !matchesFlattened.length) {
      const sr = matchSubmissionRequirements.map((e: SubmissionRequirementMatch) => e.from_nested);
      const srFlattened = [].concat(...sr);
      return this.extractVCIndexes(srFlattened);
    }
    return Array.from(new Set(matchesFlattened.map((s) => parseInt(s.match(/\d+/)[0]))));
  }

  private matchSubmissionRequirements(
    submissionRequirements: SubmissionRequirement[],
    marked: HandlerCheckResult[]
  ): SubmissionRequirementMatch[] {
    const submissionRequirementMatches: SubmissionRequirementMatch[] = [];
    for (const sr of submissionRequirements) {
      if (sr.from) {
        if (sr.rule === Rules.All || sr.rule === Rules.Pick) {
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

  private matchWithoutSubmissionRequirements(
    marked: HandlerCheckResult[],
    pd: PresentationDefinition
  ): SubmissionRequirementMatch[] {
    const submissionRequirementMatches: SubmissionRequirementMatch[] = [];
    const partitionedResults: Map<string, string[]> = this.partitionCheckResults(marked);
    for (const [idPath, sameIdVCs] of partitionedResults.entries()) {
      const idRes = JsonPathUtils.extractInputField(pd, [idPath]);
      if (idRes.length) {
        const submissionRequirementMatch: SubmissionRequirementMatch = new SubmissionRequirementMatch(
          idRes[0].value.name,
          Rules.All,
          1,
          sameIdVCs,
          null,
          null
        );
        submissionRequirementMatches.push(submissionRequirementMatch);
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
        if (srm.matches.indexOf(m.verifiable_credential_path) === -1) {
          srm.matches.push(m.verifiable_credential_path);
        }
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

  public evaluate(pd: PresentationDefinition, vp: VerifiablePresentation): EvaluationResults {
    this._client.evaluate(pd, vp);
    const result: EvaluationResults = {};
    result.warnings = this.formatNotInfo(Status.WARN);
    result.errors = this.formatNotInfo(Status.ERROR);
    if (this._client.verifiablePresentation.presentationSubmission.descriptor_map.length) {
      result.value = this._client.verifiablePresentation.presentationSubmission;
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

  public submissionFrom(pd: PresentationDefinition, vcs: VerifiableCredential[]): PresentationSubmission {
    console.log(vcs);
    if (!this._client.results) {
      throw Error('You need to call evaluate() before submissionFrom()');
    }

    let matched: [number, HandlerCheckResult[]];
    if (pd.submission_requirements) {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) =>
          result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR
      );
      matched = this.evaluateRequirements(pd.submission_requirements, marked, 0);
      const inDescIndexes = matched[1].map((e) => e.input_descriptor_path.match(/\d+/)[0]);
      const desc: InputDescriptor[] = inDescIndexes.map((i) => pd.input_descriptors[i]);
      const matchedDescriptors = this._client.verifiablePresentation.presentationSubmission.descriptor_map.filter(
        (value) => desc.map((e) => e.id).includes(value.id)
      );
      this._client.verifiablePresentation.presentationSubmission.descriptor_map = matchedDescriptors;
    }
    return this._client.verifiablePresentation.presentationSubmission;
  }

  private evaluateRequirements(
    submissionRequirement: SubmissionRequirement[],
    marked: HandlerCheckResult[],
    level: number
  ): [number, HandlerCheckResult[]] {
    let total = 0;
    const result: HandlerCheckResult[] = [];
    for (const sr of submissionRequirement) {
      if (sr.from) {
        if (sr.rule === Rules.All) {
          const [count, matched] = this.countMatchingInputDescriptors(sr, marked);
          if (count !== marked.length) {
            throw Error(`Not all input descriptors are members of group ${sr.from}`);
          }
          total++;
          result.push(...matched);
        } else if (sr.rule === Rules.Pick) {
          const [count, matched] = this.countMatchingInputDescriptors(sr, marked);
          try {
            this.handleCount(sr, count, level);
            total++;
          } catch (error) {
            if (level === 0) throw error;
          }
          result.push(...matched);
        }
      } else if (sr.from_nested) {
        const [count, matched] = this.evaluateRequirements(sr.from_nested, marked, ++level);
        total += count;
        result.push(...matched);
        this.handleCount(sr, count, level);
      }
    }
    return [total, result];
  }

  private countMatchingInputDescriptors(
    submissionRequirement: SubmissionRequirement,
    marked: HandlerCheckResult[]
  ): [number, HandlerCheckResult[]] {
    let count = 0;
    const matched: HandlerCheckResult[] = [];
    for (const m of marked) {
      if (m.payload.group.includes(submissionRequirement.from)) {
        matched.push(m);
        count++;
      }
    }
    return [count, matched];
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

  private partitionCheckResults(marked: HandlerCheckResult[]): Map<string, string[]> {
    const partitionedResults: Map<string, string[]> = new Map<string, string[]>();

    const partitionedBasedOnID: Map<string, HandlerCheckResult[]> = new Map<string, HandlerCheckResult[]>();
    for (let i = 0; i < marked.length; i++) {
      const currentIdPath: string = marked[i].input_descriptor_path;
      if (partitionedBasedOnID.has(currentIdPath)) {
        partitionedBasedOnID.get(currentIdPath).push(marked[i]);
      } else {
        partitionedBasedOnID.set(currentIdPath, [marked[i]]);
      }
    }

    for (const [idPath, sameIdCheckResults] of partitionedBasedOnID.entries()) {
      const vcPaths: string[] = [];
      for (let i = 0; i < sameIdCheckResults.length; i++) {
        if (vcPaths.indexOf(sameIdCheckResults[i].verifiable_credential_path) === -1) {
          vcPaths.push(sameIdCheckResults[i].verifiable_credential_path);
        }
      }
      partitionedResults.set(idPath, vcPaths);
    }
    return partitionedResults;
  }
}
