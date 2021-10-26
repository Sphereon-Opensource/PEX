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
      verifiableCredential: selectableCredentials,
      holder: did,
    });
    const warnings: Checked[] = [...this.formatNotInfo(Status.WARN)];
    const errors: Checked[] = [...this.formatNotInfo(Status.ERROR)];
    if (presentationDefinition.submission_requirements) {
      const info: HandlerCheckResult[] = this._client.results.filter(
        (result) =>
          result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR
      );
      const marked = Array.from(new Set(info));
      const matchSubmissionRequirements = this.matchSubmissionRequirements(
        presentationDefinition.submission_requirements,
        marked
      );
      const vcs = this.extractVCIndexes(matchSubmissionRequirements).map(
        (i) => this._client.verifiablePresentation.verifiableCredential[i]
      );
      selectResults = {
        errors: errors,
        matches: [...matchSubmissionRequirements],
        verifiableCredentials: vcs,
        warnings,
      };
    } else {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== Status.ERROR
      );

      selectResults = {
        errors: errors,
        matches: [...this.matchWithoutSubmissionRequirements(marked, presentationDefinition)],
        verifiableCredentials: this._client.verifiablePresentation.verifiableCredential,
        warnings,
      };
    }
    return selectResults;
  }

  private extractVCIndexes(matchSubmissionRequirements: SubmissionRequirementMatch[]): number[] {
    const indexes: number[] = [];
    const matchesFlattened: string[] = matchSubmissionRequirements.map((s:SubmissionRequirementMatch) => s.matches).flat();
    indexes.push(...this.parseIndexes(matchesFlattened));
    if (!matchesFlattened || !matchesFlattened.length) {
      const srFlattened: SubmissionRequirementMatch[] = [];
      matchSubmissionRequirements.forEach((e) => {
        if (e.from_nested) {
          srFlattened.push(...e.from_nested);
        }
      });
      if (srFlattened && srFlattened.length) {
        indexes.push(...this.extractVCIndexes(srFlattened));
      }
    }
    return indexes;
  }

  private parseIndexes(matchesFlattened: string[]): number[] {
    const withoutDoubles: Set<number> = new Set<number>();
    matchesFlattened.forEach((s: string) => {
      const m = s.match(/\d+/);
      if (m) {
        withoutDoubles.add(parseInt(m[0]));
      }
    });
    return Array.from(withoutDoubles);
  }

  private matchSubmissionRequirements(
    submissionRequirements: SubmissionRequirement[],
    marked: HandlerCheckResult[]
  ): SubmissionRequirementMatch[] {
    const submissionRequirementMatches: SubmissionRequirementMatch[] = [];
    for (const sr of submissionRequirements) {
      if (sr.from) {
        if (sr.rule === Rules.All || sr.rule === Rules.Pick) {
          const matchingDescriptors = this.mapMatchingDescriptors(sr, marked);
          if (matchingDescriptors) {
            submissionRequirementMatches.push(matchingDescriptors);
          }
        }
      } else if (sr.from_nested) {
        const srm = this.createSubmissionRequirementMatch(sr);
        if (srm && srm.from_nested) {
          srm.count++;
          srm.from_nested.push(...this.matchSubmissionRequirements(sr.from_nested, marked));
          submissionRequirementMatches.push(srm);
        }
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
          [],
          []
        );
        submissionRequirementMatches.push(submissionRequirementMatch);
      }
    }
    return submissionRequirementMatches;
  }

  private mapMatchingDescriptors(
    sr: SubmissionRequirement,
    marked: HandlerCheckResult[]
  ): SubmissionRequirementMatch | null {
    const srm = this.createSubmissionRequirementMatch(sr);
    if (srm?.from && sr?.from) {
      if (!srm.from.includes(sr.from)) {
        srm.from.push(sr.from);
      }
      for (const m of marked) {
        if (m.payload.group.includes(sr.from)) {
          srm.count++;
          if (srm.matches.indexOf(m.verifiable_credential_path) === -1) {
            srm.matches.push(m.verifiable_credential_path);
          }
        }
      }
    }
    return srm;
  }

  private createSubmissionRequirementMatch(sr: SubmissionRequirement): SubmissionRequirementMatch | null {
    if (sr.from) {
      return {
        rule: sr.rule,
        count: 0,
        matches: [],
        from: [],
        name: sr?.name,
      };
    } else if (sr.from_nested) {
      return {
        rule: sr.rule,
        count: 0,
        matches: [],
        from_nested: [],
        name: sr?.name,
      };
    }
    return null;
  }

  public evaluate(pd: PresentationDefinition, vp: VerifiablePresentation): EvaluationResults {
    this._client.evaluate(pd, vp);
    const result: EvaluationResults = {};
    result.warnings = this.formatNotInfo(Status.WARN);
    result.errors = this.formatNotInfo(Status.ERROR);
    if (this._client.verifiablePresentation.presentation_submission.descriptor_map.length) {
      result.value = this._client.verifiablePresentation.presentation_submission;
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
    if (!this._client.results) {
      throw Error('You need to call evaluate() before submissionFrom()');
    }

    let matched: [number, HandlerCheckResult[]];
    const marked: HandlerCheckResult[] = this._client.results.filter(
      (result) =>
        result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR
    );

    if (pd.submission_requirements) {
      const [updatedMarked, credentials] = this.matchUserSelectedVcs(marked, vcs);
      matched = this.evaluateRequirements(pd.submission_requirements, updatedMarked, 0);
      this._client.verifiablePresentation.verifiableCredential = credentials;
      return this.updatePresentationSubmission(matched[1], pd);
    }
    const [updatedMarked, credentials] = this.matchUserSelectedVcs(marked, vcs);
    this._client.verifiablePresentation.verifiableCredential = credentials;
    return this.updatePresentationSubmission(updatedMarked, pd);
  }

  private updatePresentationSubmission(
    marked: HandlerCheckResult[],
    pd: PresentationDefinition
  ): PresentationSubmission {
    const inDescIndexes: number[] = [];
    marked.forEach((e: HandlerCheckResult) => {
      const index: RegExpMatchArray | null = e.input_descriptor_path.match(/\d+/);
      if (index) {
        inDescIndexes.push(parseInt(index[0]));
      }
    });
    const desc: InputDescriptor[] = inDescIndexes.map((i: number) => pd.input_descriptors[i]);
    const matchedDescriptors = this._client.verifiablePresentation.presentation_submission.descriptor_map.filter(
      (value) => desc.map((e) => e.id).includes(value.id)
    );
    this._client.verifiablePresentation.presentation_submission.descriptor_map = matchedDescriptors;
    return this._client.verifiablePresentation.presentation_submission;
  }

  private matchUserSelectedVcs(
    marked: HandlerCheckResult[],
    vcs: VerifiableCredential[]
  ): [HandlerCheckResult[], VerifiableCredential[]] {
    const tmpMarkedVcs: [string, string][] = [];
    const allCredentials: VerifiableCredential[] = this._client.verifiablePresentation.verifiableCredential;

    marked.map((e: HandlerCheckResult) => {
      const index = e.verifiable_credential_path.match(/\d+/);
      if (index) {
        tmpMarkedVcs.push([e.verifiable_credential_path, JSON.stringify(allCredentials[parseInt(index[0])])]);
      }
    });

    const userSelected = tmpMarkedVcs.filter((e) => vcs.map((vc) => JSON.stringify(vc)).includes(e[1]));
    const credentials = userSelected.map((e) => JSON.parse(e[1])) as VerifiableCredential[];
    return [marked.filter((e) => userSelected.map((f) => f[0]).includes(e.verifiable_credential_path)), credentials];
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
        const partBasedOnID = partitionedBasedOnID.get(currentIdPath);
        if (partBasedOnID) {
          partBasedOnID.push(marked[i]);
        }
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
