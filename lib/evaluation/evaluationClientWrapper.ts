import { Descriptor, PresentationSubmission, Rules, SubmissionRequirement } from '@sphereon/pex-models';
import jp from 'jsonpath';

import { Checked, Status } from '../ConstraintUtils';
import { InternalVerifiableCredential } from '../types';
import { InternalPresentationDefinition, VerifiableCredential } from '../types/SSI.types';
import { SSITypesBuilder } from '../types/SSITypesBuilder';
import { JsonPathUtils } from '../utils';

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
    presentationDefinition: InternalPresentationDefinition,
    verifiableCredentials: InternalVerifiableCredential[],
    holderDids: string[],
    limitDisclosureSignatureSuites: string[]
  ): SelectResults {
    let selectResults: SelectResults;

    this._client.evaluate(presentationDefinition, verifiableCredentials, holderDids, limitDisclosureSignatureSuites);
    const warnings: Checked[] = [...this.formatNotInfo(Status.WARN)];
    const errors: Checked[] = [...this.formatNotInfo(Status.ERROR)];

    if (presentationDefinition.submission_requirements) {
      const info: HandlerCheckResult[] = this._client.results.filter(
        (result) =>
          result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR
      );
      const marked = Array.from(new Set(info));
      const matchSubmissionRequirements = this.matchSubmissionRequirements(
        presentationDefinition,
        presentationDefinition.submission_requirements,
        marked
      );
      const matches = this.extractMatches(matchSubmissionRequirements);
      const credentials: InternalVerifiableCredential[] = matches.map(
        (e) => jp.nodes(this._client.verifiableCredential, e)[0].value
      );
      selectResults = {
        errors: errors,
        matches: [...matchSubmissionRequirements],
        areRequiredCredentialsPresent: Status.INFO,
        verifiableCredential: SSITypesBuilder.mapInternalVerifiableCredentialsToExternal(credentials),
        warnings,
      };
    } else {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== Status.ERROR
      );
      const matchSubmissionRequirements = this.matchWithoutSubmissionRequirements(marked, presentationDefinition);
      const matches = this.extractMatches(matchSubmissionRequirements);
      const credentials: InternalVerifiableCredential[] = matches.map(
        (e) => jp.nodes(this._client.verifiableCredential, e)[0].value
      );
      selectResults = {
        errors: errors,
        matches: [...matchSubmissionRequirements],
        areRequiredCredentialsPresent: Status.INFO,
        verifiableCredential: SSITypesBuilder.mapInternalVerifiableCredentialsToExternal(credentials),
        warnings,
      };
    }

    this.fillSelectableCredentialsToVerifiableCredentialsMapping(selectResults, verifiableCredentials);
    selectResults.areRequiredCredentialsPresent = this.determineAreRequiredCredentialsPresent(selectResults?.matches);
    this.remapMatches(selectResults, verifiableCredentials);
    selectResults.matches?.forEach((m) => {
      this.updateSubmissionRequirementMatchPathToAlias(m, 'verifiableCredential');
    });
    return selectResults;
  }

  private remapMatches(selectResults: SelectResults, verifiableCredentials: InternalVerifiableCredential[]) {
    selectResults.matches?.forEach((srm) => {
      srm.vc_path.forEach((match, index, matches) => {
        const vc = jp.query(verifiableCredentials, match)[0];
        const newIndex = selectResults.verifiableCredential?.findIndex((svc) => svc.id === vc.id);
        matches[index] = `$[${newIndex}]`;
      });
      srm.name;
    });
  }

  private extractMatches(matchSubmissionRequirements: SubmissionRequirementMatch[]): string[] {
    const matches: string[] = [];
    matchSubmissionRequirements.forEach((e) => {
      matches.push(...e.vc_path);
      if (e.from_nested) {
        matches.push(...this.extractMatches(e.from_nested));
      }
    });
    return Array.from(new Set(matches));
  }

  private matchSubmissionRequirements(
    pd: InternalPresentationDefinition,
    submissionRequirements: SubmissionRequirement[],
    marked: HandlerCheckResult[]
  ): SubmissionRequirementMatch[] {
    const submissionRequirementMatches: SubmissionRequirementMatch[] = [];
    for (const sr of submissionRequirements) {
      if (sr.from) {
        const matchingDescriptors = this.mapMatchingDescriptors(pd, sr, marked);
        if (matchingDescriptors) {
          sr.min ? (matchingDescriptors.min = sr.min) : undefined;
          sr.max ? (matchingDescriptors.max = sr.max) : undefined;
          sr.count ? (matchingDescriptors.count = sr.count) : undefined;
          submissionRequirementMatches.push(matchingDescriptors);
        }
      } else if (sr.from_nested) {
        const srm: SubmissionRequirementMatch = { name: pd.name || pd.id, rule: sr.rule, from_nested: [], vc_path: [] };
        if (srm && srm.from_nested) {
          sr.min ? (srm.min = sr.min) : undefined;
          sr.max ? (srm.max = sr.max) : undefined;
          sr.count ? (srm.count = sr.count) : undefined;
          srm.from_nested.push(...this.matchSubmissionRequirements(pd, sr.from_nested, marked));
          submissionRequirementMatches.push(srm);
        }
      }
    }
    return submissionRequirementMatches;
  }

  private matchWithoutSubmissionRequirements(
    marked: HandlerCheckResult[],
    pd: InternalPresentationDefinition
  ): SubmissionRequirementMatch[] {
    const submissionRequirementMatches: SubmissionRequirementMatch[] = [];
    const partitionedResults: Map<string, string[]> = this.partitionCheckResults(marked);
    for (const [idPath, sameIdVCs] of partitionedResults.entries()) {
      const idRes = JsonPathUtils.extractInputField(pd, [idPath]);
      if (idRes.length) {
        const submissionRequirementMatch: SubmissionRequirementMatch = {
          name: idRes[0].value.name || idRes[0].value.id,
          rule: Rules.All,
          vc_path: sameIdVCs,
        };
        submissionRequirementMatches.push(submissionRequirementMatch);
      }
    }
    return this.removeDuplicateSubmissionRequirementMatches(submissionRequirementMatches);
  }

  private mapMatchingDescriptors(
    pd: InternalPresentationDefinition,
    sr: SubmissionRequirement,
    marked: HandlerCheckResult[]
  ): SubmissionRequirementMatch {
    const srm: Partial<SubmissionRequirementMatch> = { rule: sr.rule, from: [], vc_path: [] };
    if (sr?.from) {
      srm.from?.push(sr.from);
      for (const m of marked) {
        const inDesc = jp.query(pd, m.input_descriptor_path)[0];
        srm.name = inDesc.name || inDesc.id;
        if (m.payload.group.includes(sr.from)) {
          if (srm.vc_path?.indexOf(m.verifiable_credential_path) === -1) {
            srm.vc_path.push(m.verifiable_credential_path);
          }
        }
      }
    }
    return srm as SubmissionRequirementMatch;
  }

  public evaluate(
    pd: InternalPresentationDefinition,
    vcs: InternalVerifiableCredential[],
    holderDids: string[],
    limitDisclosureSignatureSuites?: string[]
  ): EvaluationResults {
    this._client.evaluate(pd, vcs, holderDids, limitDisclosureSignatureSuites);
    const result: EvaluationResults = { verifiableCredential: [...vcs] };
    result.warnings = this.formatNotInfo(Status.WARN);
    result.errors = this.formatNotInfo(Status.ERROR);
    if (this._client.presentationSubmission?.descriptor_map.length) {
      const len = this._client.presentationSubmission?.descriptor_map.length;
      for (let i = 0; i < len; i++) {
        this._client.presentationSubmission.descriptor_map[i] &&
          this._client.presentationSubmission.descriptor_map.push(
            this._client.presentationSubmission.descriptor_map[i]
          );
      }
      this._client.presentationSubmission.descriptor_map.splice(0, len); // cut the array and leave only the non-empty values
      result.value = JSON.parse(JSON.stringify(this._client.presentationSubmission));
    }
    this.updatePresentationSubmissionPathToAlias('verifiableCredential', result.value);
    result.verifiableCredential = this._client.verifiableCredential;
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

  public submissionFrom(
    pd: InternalPresentationDefinition,
    vcs: InternalVerifiableCredential[]
  ): PresentationSubmission {
    if (!this._client.results.length) {
      throw Error('You need to call evaluate() before pejs.presentationFrom()');
    }

    if (pd.submission_requirements) {
      const marked: HandlerCheckResult[] = this._client.results.filter(
        (result) =>
          result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR
      );
      const [updatedMarked, upIdx] = this.matchUserSelectedVcs(marked, vcs);
      const result: [number, HandlerCheckResult[]] = this.evaluateRequirements(
        pd.submission_requirements,
        updatedMarked,
        0
      );
      const finalIdx = upIdx.filter((ui) => result[1].find((r) => r.verifiable_credential_path === ui[1]));
      this.updatePresentationSubmission(finalIdx);
      this.updatePresentationSubmissionPathToAlias('verifiableCredential');
      return this._client.presentationSubmission;
    }
    const marked: HandlerCheckResult[] = this._client.results.filter(
      (result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== Status.ERROR
    );
    const updatedIndexes = this.matchUserSelectedVcs(marked, vcs);
    this.updatePresentationSubmission(updatedIndexes[1]);
    this.updatePresentationSubmissionPathToAlias('verifiableCredential');
    return this._client.presentationSubmission;
  }

  private updatePresentationSubmission(updatedIndexes: [string, string][]) {
    this._client.presentationSubmission.descriptor_map = this._client.presentationSubmission.descriptor_map
      .filter((descriptor) => updatedIndexes.find((ui) => ui[0] === descriptor.path))
      .map((descriptor) => {
        const result = updatedIndexes.find((ui) => ui[0] === descriptor.path);
        if (result) {
          descriptor.path = result[1];
        }
        return descriptor;
      });
  }

  private matchUserSelectedVcs(
    marked: HandlerCheckResult[],
    vcs: InternalVerifiableCredential[]
  ): [HandlerCheckResult[], [string, string][]] {
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

    marked = marked
      .filter((m) => updatedIndexes.find((ui) => ui[0] === m.verifiable_credential_path))
      .map((m) => {
        const index = updatedIndexes.find((ui) => ui[0] === m.verifiable_credential_path);
        if (index) {
          m.verifiable_credential_path = index[1];
        }
        return m;
      });
    return [marked, updatedIndexes];
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

  private removeDuplicateSubmissionRequirementMatches(matches: SubmissionRequirementMatch[]) {
    return matches.filter((match, index) => {
      const _match = JSON.stringify(match);
      return (
        index ===
        matches.findIndex((obj) => {
          return JSON.stringify(obj) === _match;
        })
      );
    });
  }

  public fillSelectableCredentialsToVerifiableCredentialsMapping(
    selectResults: SelectResults,
    verifiableCredentials: InternalVerifiableCredential[]
  ) {
    if (selectResults) {
      selectResults.verifiableCredential?.forEach((selectableCredential: VerifiableCredential) => {
        const foundIndex: number = verifiableCredentials.findIndex(
          (verifiableCredential) => selectableCredential.id === verifiableCredential.id
        );
        selectResults.vcIndexes?.push(foundIndex);
      });
    }
  }

  public determineAreRequiredCredentialsPresent(
    matchSubmissionRequirements: SubmissionRequirementMatch[] | undefined
  ): Status {
    let status = Status.INFO;
    if (!matchSubmissionRequirements || !matchSubmissionRequirements.length) {
      return Status.ERROR;
    }
    for (const m of matchSubmissionRequirements) {
      if (m.vc_path.length == 0 && (!m.from_nested || m.from_nested.length == 0)) {
        return Status.ERROR;
      } else if (m.count && m.vc_path.length < m.count && (!m.from_nested || !m.from_nested?.length)) {
        return Status.ERROR;
      } else if (m.count && (m.vc_path.length > m.count || (m.from_nested && m.from_nested?.length > m.count))) {
        status = Status.WARN;
      } else if (m.min && m.vc_path.length < m.min && m.from_nested && !m.from_nested?.length) {
        return Status.ERROR;
      } else if (m.max && (m.vc_path.length > m.max || (m.from_nested && m.from_nested?.length > m.max))) {
        status = Status.WARN;
      } else if (m.from_nested) {
        status = this.determineAreRequiredCredentialsPresent(m.from_nested);
        if (status === Status.ERROR) {
          return status;
        }
      }
    }
    return status;
  }

  private updateSubmissionRequirementMatchPathToAlias(
    submissionRequirementMatch: SubmissionRequirementMatch,
    alias: string
  ) {
    const vc_path: string[] = [];
    submissionRequirementMatch.vc_path.forEach((m) => {
      vc_path.push(m.replace('$', '$.' + alias));
    });
    submissionRequirementMatch.vc_path = vc_path;
    if (submissionRequirementMatch.from_nested) {
      submissionRequirementMatch.from_nested.forEach((f) => {
        this.updateSubmissionRequirementMatchPathToAlias(f, alias);
      });
    }
  }

  private updatePresentationSubmissionPathToAlias(alias: string, presentationSubmission?: PresentationSubmission) {
    if (presentationSubmission) {
      presentationSubmission.descriptor_map.forEach((d) => {
        this.replacePathWithAlias(d, alias);
      });
    } else {
      this._client.presentationSubmission.descriptor_map.forEach((d) => {
        this.replacePathWithAlias(d, alias);
      });
    }
  }

  private replacePathWithAlias(descriptor: Descriptor, alias: string) {
    descriptor.path = descriptor.path.replace('$', '$.' + alias);
    if (descriptor.path_nested) {
      this.replacePathWithAlias(descriptor.path_nested, alias);
    }
  }
}
