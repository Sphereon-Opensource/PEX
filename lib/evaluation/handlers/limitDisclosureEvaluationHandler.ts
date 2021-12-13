import { Field, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import jp, { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { JsonPathUtils } from '../../utils';
import { VerifiableCredential, VerifiableCredentialJsonLD, VerifiableCredentialJwt } from '../../types/SSI.types';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class LimitDisclosureEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'LimitDisclosureEvaluation';
  }

  public handle(pd: PresentationDefinition, vcs: VerifiableCredential[]): void {
    const updatedVCs: VerifiableCredential[] = [];
    vcs.forEach((vc, index) => {
      const result: VerifiableCredential[] = this.createRevealDocuments(vc, pd, index);
      if (result.length) {
        updatedVCs.push(result[0]);
      } else {
        updatedVCs.push(vc);
      }
    });
    this.verifiableCredential = updatedVCs;
    if (this.getResults().filter((r) => r.evaluator === 'LimitDisclosureEvaluation').length) {
      this.presentationSubmission.descriptor_map = this.getResults()
        .filter((r) => r.status !== Status.ERROR && r.evaluator === 'LimitDisclosureEvaluation')
        .flatMap((r) => {
          /**
           * TODO Map nested credentials
           */
          const inputDescriptor: InputDescriptor = jp.query(pd, r.input_descriptor_path)[0];
          return this.presentationSubmission.descriptor_map.filter(
            (ps) => ps.path === r.verifiable_credential_path && ps.id === inputDescriptor.id
          );
        });
    }
  }

  private createRevealDocuments(
    verifiableCredential: VerifiableCredential,
    presentationDefinition: PresentationDefinition,
    vcIdx: number
  ): VerifiableCredential[] {
    const result: VerifiableCredential[] = [];
    //TODO: find a better solution for handling jwt VCs
    const revealDocument: VerifiableCredential = this.createWithMandatoryFields(verifiableCredential);
    presentationDefinition.input_descriptors.forEach((inDesc: InputDescriptor, idIdx) => {
      if (inDesc?.constraints?.fields && inDesc?.constraints?.limit_disclosure === Optionality.Required) {
        this.determineNecessaryPaths(verifiableCredential, revealDocument, inDesc.constraints.fields);
        result.push(revealDocument);
      }
      this.createSuccessResult(idIdx, `$.input_descriptors[${vcIdx}]`);
    });
    return result;
  }

  private determineNecessaryPaths(
    vc: VerifiableCredential,
    revealDocument: VerifiableCredential,
    fields: Field[]
  ): void {
    for (let i = 0; i < fields.length; i++) {
      const field: Field = fields[i];
      if (field && field.path) {
        const inputField = JsonPathUtils.extractInputField(vc, field.path);
        if (inputField.length > 0) {
          this.copyResultPathToDestinationCredential(inputField[0].path, vc, revealDocument);
        } else {
          console.log(`Warning: mandatory field ${field.path} not found.`);
        }
      }
    }
  }

  private copyResultPathToDestinationCredential(
    requiredField: { path: PathComponent[]; value: unknown },
    verifiableCredential: VerifiableCredential,
    verifiableCredentialToSend: VerifiableCredential
  ): VerifiableCredential {
    let credentialSubject = { ...verifiableCredential.getBaseCredential().credentialSubject };
    requiredField.path.forEach((e) => {
      if (credentialSubject[e]) {
        credentialSubject = { [e]: credentialSubject[e] } as { [x: string]: unknown };
      }
    });
    let result: VerifiableCredential;
    if (verifiableCredentialToSend as VerifiableCredentialJsonLD) {
      result = {
        ...verifiableCredentialToSend,
      } as VerifiableCredentialJsonLD;
    } else {
      result = {
        ...verifiableCredentialToSend,
      } as VerifiableCredentialJwt;
    }
    result.getBaseCredential().credentialSubject = { ...credentialSubject };
    return result;
  }

  private createSuccessResult(idIdx: number, path: string) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `${path}`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: 'added variable in the limit_disclosure to the verifiableCredential',
      payload: undefined,
    });
  }

  private createWithMandatoryFields(verifiableCredential: VerifiableCredential): VerifiableCredential {
    let revealDocument: VerifiableCredential;
    if (verifiableCredential as VerifiableCredentialJwt) {
      const vcJWT: VerifiableCredentialJwt = verifiableCredential as VerifiableCredentialJwt;
      revealDocument = {
        exp: vcJWT.exp,
        iss: vcJWT.iss,
        nbf: vcJWT.nbf,
        vc: {
          '@context': vcJWT.vc['@context'],
          issuer: vcJWT.vc.issuer,
          issuanceDate: vcJWT.vc.issuanceDate,
          id: vcJWT.vc.id,
          credentialSubject: vcJWT.vc.credentialSubject,
          type: vcJWT.vc.type,
        },
        proof: vcJWT.proof,
      } as VerifiableCredentialJwt;
    } else {
      const vcJsonLD: VerifiableCredentialJsonLD = verifiableCredential as VerifiableCredentialJsonLD;
      revealDocument = {
        '@context': vcJsonLD['@context'],
        issuer: vcJsonLD.issuer,
        issuanceDate: vcJsonLD.issuanceDate,
        id: vcJsonLD.id,
        credentialSubject: vcJsonLD.credentialSubject,
        type: vcJsonLD.type,
        proof: vcJsonLD.proof,
      } as VerifiableCredentialJsonLD;
    }
    return revealDocument;
  }
}
