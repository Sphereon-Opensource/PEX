import {
  PresentationDefinitionV1 as PdV1,
  PresentationDefinitionV2 as PdV2,
  PresentationSubmission,
} from '@sphereon/pe-models';

import { EvaluationClientWrapper, EvaluationResults, SelectResults } from './evaluation';
import { PresentationSignCallBackParams, PresentationSignOptions } from './signing';
import { PresentationSignCallBackParamsV1, PresentationSignCallBackParamsV2 } from './signing/types';
import { Presentation, Proof, VerifiableCredential, VerifiablePresentation } from './types';
import { PEVersion, VerifiableCredentialJsonLD, VerifiableCredentialJwt } from './types/SSI.types';
import { SSITypesBuilder } from './types/SSITypesBuilder';
import {
  PresentationDefinitionV1VB,
  PresentationDefinitionV2VB,
  PresentationSubmissionVB,
  Validated,
  ValidationEngine,
} from './validation';

/**
 * This is the main interfacing class to be used from out side the library to use the functionality provided by the library.
 */
export class PEJS {
  private _evaluationClientWrapper: EvaluationClientWrapper;

  constructor() {
    this._evaluationClientWrapper = new EvaluationClientWrapper();
  }

  /***
   * The evaluatePresentationV1 compares what is expected from a presentation with a presentationDefinitionV1.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param presentation the presentation which has to be evaluated in comparison of the definition.
   * @param limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the presentation.
   */
  public evaluatePresentationV1(
    presentationDefinition: PdV1,
    presentation: Presentation,
    limitDisclosureSignatureSuites?: string[]
  ): EvaluationResults {
    const presentationCopy: Presentation = JSON.parse(JSON.stringify(presentation));
    presentationCopy.verifiableCredential = this.recognizeAndEditVCs(presentationCopy.verifiableCredential);
    this._evaluationClientWrapper = new EvaluationClientWrapper();

    const holderDIDs = presentation.holder ? [presentation.holder] : [];
    return this._evaluationClientWrapper.evaluate(
      SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition),
      presentationCopy.verifiableCredential,
      holderDIDs,
      limitDisclosureSignatureSuites
    );
  }

  /***
   * The evaluatePresentationV2 compares what is expected from a presentation with a presentationDefinitionV2.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param presentation the presentation which has to be evaluated in comparison of the definition.
   * @param limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the presentation.
   */
  public evaluatePresentationV2(
    presentationDefinition: PdV2,
    presentation: Presentation,
    limitDisclosureSignatureSuites?: string[]
  ): EvaluationResults {
    const presentationCopy: Presentation = JSON.parse(JSON.stringify(presentation));
    presentationCopy.verifiableCredential = this.recognizeAndEditVCs(presentationCopy.verifiableCredential);
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    const holderDIDs = presentation.holder ? [presentation.holder] : [];
    return this._evaluationClientWrapper.evaluate(
      SSITypesBuilder.createInternalPresentationDefinitionV2FromModelEntity(presentationDefinition),
      presentationCopy.verifiableCredential,
      holderDIDs,
      limitDisclosureSignatureSuites
    );
  }

  /***
   * The evaluate compares what is expected from a verifiableCredentials with the presentationDefinition.
   *
   * @param presentationDefinition the v1 definition of what is expected in the presentation.
   * @param verifiableCredentials the verifiable credentials which are candidates to fulfill requirements defined in the presentationDefinition param.
   * @param holderDIDs the list of the DIDs that the wallet holders controlls.
   * @param limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the verifiable credentials.
   */
  public evaluateCredentialsV1(
    presentationDefinition: PdV1,
    verifiableCredentials: VerifiableCredential[],
    holderDIDs: string[],
    limitDisclosureSignatureSuites: string[]
  ): EvaluationResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.evaluate(
      SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition),
      this.recognizeAndEditVCs(verifiableCredentialCopy),
      holderDIDs,
      limitDisclosureSignatureSuites
    );
  }

  /***
   * The evaluateCredentialsV2 compares what is expected from a verifiableCredentials with the presentationDefinitionV2.
   *
   * @param presentationDefinition the v2 definition of what is expected in the presentation.
   * @param verifiableCredentials the verifiable credentials which are candidates to fulfill requirements defined in the presentationDefinition param.
   * @param holderDIDs the list of the DIDs that the wallet holders controlls.
   * @param limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the verifiable credentials.
   */
  public evaluateCredentialsV2(
    presentationDefinition: PdV2,
    verifiableCredentials: VerifiableCredential[],
    holderDIDs: string[],
    limitDisclosureSignatureSuites: string[]
  ): EvaluationResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.evaluate(
      SSITypesBuilder.createInternalPresentationDefinitionV2FromModelEntity(presentationDefinition),
      this.recognizeAndEditVCs(verifiableCredentialCopy),
      holderDIDs,
      limitDisclosureSignatureSuites
    );
  }

  /**
   * The selectFromV1 method is a helper function that helps filter out the verifiable credentials which can not be selected and returns
   * the selectable credentials.
   *
   * @param presentationDefinition the v1 definition of what is expected in the presentation.
   * @param verifiableCredentials verifiable credentials are the credentials from wallet provided to the library to find selectable credentials.
   * @param holderDIDs the decentralized identity of the wallet holder. This is used to identify the credentials issued to the holder of wallet.
   * @param limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the selectable credentials.
   */
  public selectFromV1(
    presentationDefinition: PdV1,
    verifiableCredentials: VerifiableCredential[],
    holderDIDs: string[],
    limitDisclosureSignatureSuites: string[]
  ): SelectResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.selectFrom(
      SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition),
      this.recognizeAndEditVCs(verifiableCredentialCopy),
      holderDIDs,
      limitDisclosureSignatureSuites
    );
  }

  /**
   * The selectFromV2 method is a helper function that helps filter out the verifiable credentials which can not be selected and returns
   * the selectable credentials.
   *
   * @param presentationDefinition the v2 definition of what is expected in the presentation.
   * @param verifiableCredentials verifiable credentials are the credentials from wallet provided to the library to find selectable credentials.
   * @param holderDIDs the decentralized identity of the wallet holder. This is used to identify the credentials issued to the holder of wallet.
   * @param limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the selectable credentials.
   */
  public selectFromV2(
    presentationDefinition: PdV2,
    verifiableCredentials: VerifiableCredential[],
    holderDIDs: string[],
    limitDisclosureSignatureSuites: string[]
  ): SelectResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.selectFrom(
      SSITypesBuilder.createInternalPresentationDefinitionV2FromModelEntity(presentationDefinition),
      this.recognizeAndEditVCs(verifiableCredentialCopy),
      holderDIDs,
      limitDisclosureSignatureSuites
    );
  }

  /**
   * This method helps create a submittablePresentation. A submittablePresentation after signing becomes a Presentation. And can be sent to
   * the verifier after signing it.
   *
   * @param presentationDefinition the v1 definition of what is expected in the presentation.
   * @param selectedCredential the credentials which were declared selectable by getSelectableCredentials and then chosen by the intelligent-user
   * (e.g. human).
   * @param holderDID optional; the decentralized identity of the wallet holder. This is used to identify the holder of the presentation.
   *
   * @return the presentation.
   */
  public presentationFromV1(
    presentationDefinition: PdV1,
    selectedCredential: VerifiableCredential[],
    holderDID?: string
  ): Presentation {
    const presentationSubmission = this._evaluationClientWrapper.submissionFrom(
      SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(presentationDefinition),
      selectedCredential
    );
    return PEJS.getPresentation(presentationSubmission, selectedCredential, holderDID);
  }

  /**
   * This method helps create a submittablePresentation. A submittablePresentation after signing becomes a Presentation. And can be sent to
   * the verifier after signing it.
   *
   * @param presentationDefinition the v1 definition of what is expected in the presentation.
   * @param selectedCredential the credentials which were declared selectable by getSelectableCredentials and then chosen by the intelligent-user
   * (e.g. human).
   * @param holderDID optional; the decentralized identity of the wallet holder. This is used to identify the holder of the presentation.
   *
   * @return the presentation.
   */
  public presentationFromV2(
    presentationDefinition: PdV2,
    selectedCredential: VerifiableCredential[],
    holderDID?: string
  ): Presentation {
    const presentationSubmission = this._evaluationClientWrapper.submissionFrom(
      SSITypesBuilder.createInternalPresentationDefinitionV2FromModelEntity(presentationDefinition),
      selectedCredential
    );
    return PEJS.getPresentation(presentationSubmission, selectedCredential, holderDID);
  }

  private static getPresentation(
    presentationSubmission: PresentationSubmission,
    selectedCredential: VerifiableCredential[],
    holderDID?: string
  ): Presentation {
    const holder = holderDID;
    return {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://identity.foundation/presentation-exchange/submission/v1',
      ],
      type: [
        'VerifiablePresentation',
        'PresentationSubmission', // This will be truly verifiable after the proof field is populated.
      ],
      holder,
      presentation_submission: presentationSubmission,
      verifiableCredential: selectedCredential,
    };
  }

  /**
   * This method validates whether an object is usable as a presentation definition or not.
   *
   * @param presentationDefinitionV1 the object to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation definition
   */
  public validateDefinitionV1(presentationDefinitionV1: PdV1): Validated {
    return new ValidationEngine().validate([
      {
        bundler: new PresentationDefinitionV1VB('root'),
        target: presentationDefinitionV1,
      },
    ]);
  }

  /**
   * This method validates whether an object is usable as a presentation definition or not.
   *
   * @param presentationDefinitionV2 the object to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation definition
   */
  public validateDefinitionV2(presentationDefinitionV2: PdV2): Validated {
    return new ValidationEngine().validate([
      {
        bundler: new PresentationDefinitionV2VB('root'),
        target: presentationDefinitionV2,
      },
    ]);
  }

  /**
   * This method validates whether an object is usable as a presentation submission or not.
   *
   * @param presentationSubmission the object to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation submission
   */
  public validateSubmission(presentationSubmission: PresentationSubmission): Validated {
    return new ValidationEngine().validate([
      {
        bundler: new PresentationSubmissionVB('root'),
        target: presentationSubmission,
      },
    ]);
  }

  /**
   * This method can be used to combine a definition, selected Verifiable Credentials, together with
   * signing options and a callback to sign a presentation, making it a Verifiable Presentation before sending.
   *
   * Please note that PE-JS has no signature support on purpose. We didn't want this library to depend on all kinds of signature suites.
   * The callback function next to the Signing Params also gets a Presentation which is evaluated against the definition.
   * It is up to you to decide whether you simply update the supplied partial proof and add it to the presentation in the callback,
   * or whether you will use the selected Credentials, Presentation definition, evaluation results and/or presentation submission together with the signature options
   *
   * @param presentationDefinition the Presentation Definition V1
   * @param selectedCredentials the PE-JS and/or User selected/filtered credentials that will become part of the Verifiable Presentation
   * @param signingCallBack the function which will be provided as a parameter. And this will be the method that will be able to perform actual
   *        signing. One example of signing is available in the project named. pe-selective-disclosure.
   * @param options: Signing Params these are the signing params required to sign.
   *
   * @return the signed and thus Verifiable Presentation.
   */
  public verifiablePresentationFromV1(
    presentationDefinition: PdV1,
    selectedCredentials: VerifiableCredential[],
    signingCallBack: (callBackParams: PresentationSignCallBackParams) => VerifiablePresentation,
    options: PresentationSignOptions
  ): VerifiablePresentation {
    const { holder, signatureOptions, proofOptions } = options;

    function limitedDisclosureSuites() {
      let limitDisclosureSignatureSuites: string[] = [];
      if (proofOptions?.typeSupportsSelectiveDisclosure) {
        if (!proofOptions?.type) {
          throw Error('Please provide a proof type if you enable selective disclosure');
        }
        limitDisclosureSignatureSuites = [proofOptions.type];
      }
      return limitDisclosureSignatureSuites;
    }

    const holderDIDs: string[] = holder ? [holder] : [];
    const limitDisclosureSignatureSuites = limitedDisclosureSuites();
    this.evaluateCredentialsV1(presentationDefinition, selectedCredentials, holderDIDs, limitDisclosureSignatureSuites);

    const presentation = this.presentationFromV1(presentationDefinition, selectedCredentials, holder);
    const evaluationResults = this.evaluatePresentationV1(
      presentationDefinition,
      presentation,
      limitDisclosureSignatureSuites
    );
    if (!evaluationResults.value) {
      throw new Error('Could not get evaluation results from presentation');
    }

    const proof: Partial<Proof> = {
      type: proofOptions?.type,
      verificationMethod: signatureOptions?.verificationMethod,
      created: proofOptions?.created ? proofOptions.created : new Date().toISOString(),
      proofPurpose: proofOptions?.proofPurpose,
      proofValue: signatureOptions?.proofValue,
      jws: signatureOptions?.jws,
      challenge: proofOptions?.challenge,
      nonce: proofOptions?.nonce,
      domain: proofOptions?.domain,
    };

    const callBackParams: PresentationSignCallBackParamsV1 = {
      options,
      presentation,
      presentationDefinition,
      selectedCredentials,
      proof,
      presentationSubmission: evaluationResults.value,
      evaluationResults,
    };

    return signingCallBack(callBackParams);
  }

  /**
   * This method can be used to combine a definition, selected Verifiable Credentials, together with
   * signing options and a callback to sign a presentation, making it a Verifiable Presentation before sending.
   *
   * Please note that PE-JS has no signature support on purpose. We didn't want this library to depend on all kinds of signature suites.
   * The callback function next to the Signing Params also gets a Presentation which is evaluated against the definition.
   * It is up to you to decide whether you simply update the supplied partial proof and add it to the presentation in the callback,
   * or whether you will use the selected Credentials, Presentation definition, evaluation results and/or presentation submission together with the signature options
   *
   * @param presentationDefinition the Presentation Definition V2
   * @param selectedCredentials the PE-JS and/or User selected/filtered credentials that will become part of the Verifiable Presentation
   * @param signingCallBack the function which will be provided as a parameter. And this will be the method that will be able to perform actual
   *        signing. One example of signing is available in the project named. pe-selective-disclosure.
   * @param options: Signing Params these are the signing params required to sign.
   *
   * @return the signed and thus Verifiable Presentation.
   */
  public verifiablePresentationFromV2(
    presentationDefinition: PdV2,
    selectedCredentials: VerifiableCredential[],
    signingCallBack: (callBackParams: PresentationSignCallBackParams) => VerifiablePresentation,
    options: PresentationSignOptions
  ): VerifiablePresentation {
    const { holder, signatureOptions, proofOptions } = options;

    function limitedDisclosureSuites() {
      let limitDisclosureSignatureSuites: string[] = [];
      if (proofOptions?.typeSupportsSelectiveDisclosure) {
        if (!proofOptions?.type) {
          throw Error('Please provide a proof type if you enable selective disclosure');
        }
        limitDisclosureSignatureSuites = [proofOptions.type];
      }
      return limitDisclosureSignatureSuites;
    }

    const holderDIDs: string[] = holder ? [holder] : [];
    const limitDisclosureSignatureSuites = limitedDisclosureSuites();
    this.evaluateCredentialsV2(presentationDefinition, selectedCredentials, holderDIDs, limitDisclosureSignatureSuites);

    const presentation = this.presentationFromV2(presentationDefinition, selectedCredentials, holder);
    const evaluationResults = this.evaluatePresentationV2(
      presentationDefinition,
      presentation,
      limitDisclosureSignatureSuites
    );
    if (!evaluationResults.value) {
      throw new Error('Could not get evaluation results from presentation');
    }

    const proof: Partial<Proof> = {
      type: proofOptions?.type,
      verificationMethod: signatureOptions?.verificationMethod,
      created: proofOptions?.created ? proofOptions.created : new Date().toISOString(),
      proofPurpose: proofOptions?.proofPurpose,
      proofValue: signatureOptions?.proofValue,
      jws: signatureOptions?.jws,
      challenge: proofOptions?.challenge,
      nonce: proofOptions?.nonce,
      domain: proofOptions?.domain,
    };

    const callBackParams: PresentationSignCallBackParamsV2 = {
      options,
      presentation,
      presentationDefinition,
      selectedCredentials,
      proof,
      presentationSubmission: evaluationResults.value,
      evaluationResults,
    };

    return signingCallBack(callBackParams);
  }

  public definitionVersionDiscovery(presentationDefinition: PdV2 | PdV1): { version?: PEVersion; error?: string } {
    let version = undefined;
    for (const key of Object.keys(presentationDefinition)) {
      if (key === 'frame') {
        if (version === PEVersion.v1) {
          return { error: 'This is not a valid PresentationDefinition' };
        }
        version = PEVersion.v2;
      } else if (key === 'input_descriptors') {
        for (const id of presentationDefinition['input_descriptors']) {
          for (const idKey of Object.keys(id)) {
            if (idKey === 'schema') {
              if (version === PEVersion.v2) {
                return { error: 'This is not a valid PresentationDefinition' };
              }
              version = PEVersion.v1;
            }
          }
        }
      }
    }
    if (!version) {
      version = PEVersion.v2;
    }
    return { version: version };
  }

  private recognizeAndEditVCs(verifiableCredential: VerifiableCredential[]): VerifiableCredential[] {
    const vcs: VerifiableCredential[] = [];
    for (let i = 0; i < verifiableCredential.length; i++) {
      if (verifiableCredential[i]['vc']) {
        let vc: VerifiableCredential = new VerifiableCredentialJwt();
        vc = Object.assign(vc, verifiableCredential[i]);
        vcs.push(vc);
      } else {
        let vc: VerifiableCredential = new VerifiableCredentialJsonLD();
        vc = Object.assign(vc, verifiableCredential[i]);
        vcs.push(vc);
      }
    }
    return vcs;
  }
}
