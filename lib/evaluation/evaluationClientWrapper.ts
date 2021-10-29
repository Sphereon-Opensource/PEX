import {
  InputDescriptor,
  PresentationDefinition,
  PresentationSubmission,
  Rules,
  SubmissionRequirement,
} from '@sphereon/pe-models';
import jp from 'jsonpath';

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
      const matches = this.extractMatches(matchSubmissionRequirements);
      const credentials: VerifiableCredential[] = matches.map(
        (e) => jp.nodes(this._client.verifiableCredential, e)[0].value
      );
      selectResults = {
        errors: errors,
        matches: [...matchSubmissionRequirements],
        verifiableCredentials: [...credentials],
        warnings,
      };
    } else {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== Status.ERROR
      );

      selectResults = {
        errors: errors,
        matches: [...this.matchWithoutSubmissionRequirements(marked, presentationDefinition)],
        verifiableCredentials: [...this._client.verifiableCredential],
        warnings,
      };
    }
    return selectResults;
  }

  private extractMatches(matchSubmissionRequirements: SubmissionRequirementMatch[]): string[] {
    const matches: string[] = [];
    matchSubmissionRequirements.forEach((e) => {
      matches.push(...e.matches);
      if (e.from_nested) {
        matches.push(...this.extractMatches(e.from_nested));
      }
    });
    return Array.from(new Set(matches));
  }

  private matchSubmissionRequirements(
    submissionRequirements: SubmissionRequirement[],
    marked: HandlerCheckResult[]
  ): SubmissionRequirementMatch[] {
    const submissionRequirementMatches: SubmissionRequirementMatch[] = [];
    for (const sr of submissionRequirements) {
      if (sr.from) {
        const matchingDescriptors = this.mapMatchingDescriptors(sr, marked);
        if (matchingDescriptors) {
          sr.min ? (matchingDescriptors.min = sr.min) : undefined;
          sr.max ? (matchingDescriptors.max = sr.max) : undefined;
          sr.count ? (matchingDescriptors.count = sr.count) : undefined;
          submissionRequirementMatches.push(matchingDescriptors);
        }
      } else if (sr.from_nested) {
        const srm = this.createSubmissionRequirementMatch(sr);
        if (srm && srm.from_nested) {
          sr.min ? (srm.min = sr.min) : undefined;
          sr.max ? (srm.max = sr.max) : undefined;
          sr.count ? (srm.count = sr.count) : undefined;
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
        const submissionRequirementMatch: SubmissionRequirementMatch = {
          name: idRes[0].value.name,
          rule: Rules.All,
          matches: sameIdVCs,
        };
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
        matches: [],
        from: [],
        name: sr?.name,
      };
    } else if (sr.from_nested) {
      return {
        rule: sr.rule,
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
    if (this._client.presentationSubmission?.descriptor_map.length) {
      result.value = this._client.presentationSubmission;
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
    if (!this._client.results.length) {
      throw Error('You need to call evaluate() before submissionFrom()');
    }

    let matched: [number, HandlerCheckResult[]];
    const marked: HandlerCheckResult[] = this._client.results.filter(
      (result) =>
        result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR
    );

    if (pd.submission_requirements) {
      const [updatedMarked, credentials, vcsMap] = this.matchUserSelectedVcs(marked, vcs);
      matched = this.evaluateRequirements(pd.submission_requirements, updatedMarked, 0);
      this._client.verifiableCredential = credentials;
      return this.updatePresentationSubmission(matched[1], pd, vcsMap);
    }
    const [updatedMarked, credentials, vcsMap] = this.matchUserSelectedVcs(marked, vcs);
    this._client.verifiableCredential = credentials;
    return this.updatePresentationSubmission(updatedMarked, pd, vcsMap);
  }

  private updatePresentationSubmission(
    marked: HandlerCheckResult[],
    pd: PresentationDefinition,
    vcsMap: [string, string][]
  ): PresentationSubmission {
    const inDescIndexes: number[] = [];
    marked.forEach((e: HandlerCheckResult) => {
      const index: RegExpMatchArray | null = e.input_descriptor_path.match(/\d+/);
      if (index) {
        inDescIndexes.push(parseInt(index[0]));
      }
    });
    const desc: InputDescriptor[] = inDescIndexes.map((i: number) => pd.input_descriptors[i]);
    const matchedDescriptors = this._client.presentationSubmission?.descriptor_map.filter((value) =>
      desc.map((e) => e.id).includes(value.id)
    );

    matchedDescriptors
      .map((d) =>
        vcsMap.map((m) => {
          if (m[0] === d.path) {
            d.path = m[1];
          }
          return d;
        })
      )
      .flat();

    if (this._client.presentationSubmission?.descriptor_map && matchedDescriptors) {
      this._client.presentationSubmission.descriptor_map = matchedDescriptors;
    }
    return this._client.presentationSubmission as PresentationSubmission;
  }

  private matchUserSelectedVcs(
    marked: HandlerCheckResult[],
    vcs: VerifiableCredential[]
  ): [HandlerCheckResult[], VerifiableCredential[], [string, string][]] {
    const userSelected: [number, string][] = vcs.map((vc, index) => [index, JSON.stringify(vc)]);
    const allCredentials: [number, string][] = this._client.verifiableCredential.map((vc, index) => [
      index,
      JSON.stringify(vc),
    ]);
    const updatedIndexes: [string, string][] = [];
    userSelected.forEach((us, i) => {
      allCredentials.forEach((ac, j) => {
        if (ac[1] === us[1]) {
          updatedIndexes.push([`$[${j}]`, `$[${i}]`]);
        }
      });
    });

    marked = marked.map((m) => {
      const index = updatedIndexes.find((ui) => ui[0] === m.verifiable_credential_path);
      if (index) {
        m.verifiable_credential_path = index[1];
      }
      return m;
    });
    return [marked, vcs, updatedIndexes];
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
