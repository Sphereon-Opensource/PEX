import { Constraints, Field, Format, InputDescriptor, Optionality, PresentationDefinition } from '@sphereon/pe-models';
import { PathComponent } from 'jsonpath';

import { Status } from '../../ConstraintUtils';
import { JsonPathUtils } from '../../utils/jsonPathUtils';
import { VerifiableCredential } from '../../verifiablePresentation';
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
    if (this.limitDisclosureSupported(pd)) {
      pd.input_descriptors.forEach((inDesc: InputDescriptor, index: number) => {
        //TODO need to check if limit disclosure is supported at input descriptor level
        if (
          inDesc.constraints?.fields &&
          (inDesc.constraints?.limit_disclosure === Optionality.Required ||
            inDesc.constraints?.limit_disclosure === Optionality.Preferred)
        ) {
          this.enforceLimitDisclosure(vcs, inDesc.constraints, index);
        }
      });
    }
  }

  //TODO needs to be updated after the format is present in input descriptors (pe-models)
  private limitDisclosureSupported(pd: PresentationDefinition): boolean {
    const limitDisclosureSignatures = process.env.LIMIT_DISCLOSURE_SIGNATURES?.split(', ');
    if (!pd.format || !Object.keys(pd.format as Format).find((f) => limitDisclosureSignatures?.includes(f))) {
      //this.createLimitDisclosureNotSupportedResult();
      return true;
    }
    return true;
  }

  private enforceLimitDisclosure(
    verifiableCredential: VerifiableCredential[],
    constraints: Constraints,
    idIdx: number
  ): void {
    const fields = constraints?.fields as Field[];
    const limitDisclosure = constraints.limit_disclosure as Optionality;
    verifiableCredential.forEach((vc, index) => {
      const verifiableCredentialToSend = this.createVcWithRequiredFields(vc, fields, idIdx, index);
      if (verifiableCredentialToSend) {
        verifiableCredential[index] = verifiableCredentialToSend;
        this.createSuccessResult(idIdx, `$[${index}]`, limitDisclosure);
      }
    });
  }

  private createVcWithRequiredFields(
    vc: VerifiableCredential,
    fields: Field[],
    idIdx: number,
    vcIdx: number
  ): VerifiableCredential | undefined {
    let vcToSend: VerifiableCredential = { ...vc, credentialSubject: {} };
    fields.forEach((field) => {
      if (field.path) {
        const inputField = JsonPathUtils.extractInputField(vc, field.path);
        if (inputField.length > 0) {
          vcToSend = this.copyResultPathToDestinationCredential(inputField[0], vc, vcToSend);
        } else {
          this.createMandatoryFieldNotFoundResult(idIdx, vcIdx, field.path);
        }
      }
    });
    return vcToSend;
  }

  private copyResultPathToDestinationCredential(
    requiredField: { path: PathComponent[]; value: unknown },
    verifiableCredential: VerifiableCredential,
    verifiableCredentialToSend: VerifiableCredential
  ): VerifiableCredential {
    let credentialSubject = { ...verifiableCredential?.credentialSubject };
    requiredField.path.forEach((e) => {
      if (credentialSubject[e]) {
        credentialSubject = { [e]: credentialSubject[e] } as { [x: string]: unknown };
      }
    });
    return {
      ...verifiableCredentialToSend,
      credentialSubject: { ...verifiableCredentialToSend.credentialSubject, ...credentialSubject },
    };
  }

  private createSuccessResult(idIdx: number, path: string, limitDisclosure: Optionality) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `${path}`,
      evaluator: this.getName(),
      status: limitDisclosure === Optionality.Required ? Status.INFO : Status.WARN,
      message: 'added variable in the limit_disclosure to the verifiableCredential',
      payload: undefined,
    });
  }

  private createMandatoryFieldNotFoundResult(idIdx: number, vcIdx: number, path: string[]) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: 'mandatory field not present in the verifiableCredential',
      payload: path,
    });
  }

  // private createLimitDisclosureNotSupportedResult(idIdx?: number, vcIdx?: number) {
  //   return this.getResults().push({
  //     input_descriptor_path: idIdx ? `$.input_descriptors[${idIdx}]` : `$.input_descriptors[*]`,
  //     verifiable_credential_path: vcIdx ? `$[${vcIdx}]` : `$[*]`,
  //     evaluator: this.getName(),
  //     status: Status.ERROR,
  //     message: 'Limit disclosure not supported',
  //   });
  // }
}
