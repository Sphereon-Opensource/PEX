import { PresentationDefinitionV1, PresentationDefinitionV2, PresentationSubmission } from '@sphereon/pex-models';
import Ajv from 'ajv';

import { EvaluationClientWrapper, EvaluationResults, SelectResults } from './evaluation';
import { PresentationSignCallBackParams, PresentationSignOptions } from './signing';
import { InternalVerifiableCredential, Presentation, Proof, VerifiablePresentation } from './types';
import { InternalPresentationDefinition, PEVersion, VerifiableCredential } from './types/SSI.types';
import { SSITypesBuilder } from './types/SSITypesBuilder';
import {
  PresentationDefinitionV1VB,
  PresentationDefinitionV2VB,
  PresentationSubmissionVB,
  Validated,
  ValidationEngine,
} from './validation';
import { PresentationDefinitionSchema } from './validation/core/presentationDefinitionSchema';

/**
 * This is the main interfacing class to be used from out side the library to use the functionality provided by the library.
 */
export class PEX {
  private _evaluationClientWrapper: EvaluationClientWrapper;

  constructor() {
    this._evaluationClientWrapper = new EvaluationClientWrapper();
  }

  /***
   * The evaluatePresentation compares what is expected from a presentation with a presentationDefinition.
   * presentationDefinition: It can be either v1 or v2 of presentationDefinition
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param presentation the presentation which has to be evaluated in comparison of the definition.
   * @param limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the presentation.
   */
  public evaluatePresentation(
    presentationDefinition: PresentationDefinitionV1 | PresentationDefinitionV2,
    presentation: Presentation,
    limitDisclosureSignatureSuites?: string[]
  ): EvaluationResults {
    const pd: InternalPresentationDefinition =
      this.determineAndCastToInternalPresentationDefinition(presentationDefinition);
    const presentationCopy: Presentation = JSON.parse(JSON.stringify(presentation));
    const internalVCs: InternalVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToInternal(
      presentationCopy.verifiableCredential
    );
    this._evaluationClientWrapper = new EvaluationClientWrapper();

    const holderDIDs = presentation.holder ? [presentation.holder] : [];
    return this._evaluationClientWrapper.evaluate(pd, internalVCs, holderDIDs, limitDisclosureSignatureSuites);
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
  public evaluateCredentials(
    presentationDefinition: PresentationDefinitionV1 | PresentationDefinitionV2,
    verifiableCredentials: VerifiableCredential[],
    holderDIDs: string[],
    limitDisclosureSignatureSuites: string[]
  ): EvaluationResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    const pd: InternalPresentationDefinition =
      this.determineAndCastToInternalPresentationDefinition(presentationDefinition);
    return this._evaluationClientWrapper.evaluate(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToInternal(verifiableCredentialCopy),
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
  public selectFrom(
    presentationDefinition: PresentationDefinitionV1 | PresentationDefinitionV2,
    verifiableCredentials: InternalVerifiableCredential[],
    holderDIDs: string[],
    limitDisclosureSignatureSuites: string[]
  ): SelectResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    const pd: InternalPresentationDefinition =
      this.determineAndCastToInternalPresentationDefinition(presentationDefinition);
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.selectFrom(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToInternal(verifiableCredentialCopy),
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
  public presentationFrom(
    presentationDefinition: PresentationDefinitionV1 | PresentationDefinitionV2,
    selectedCredential: VerifiableCredential[],
    holderDID?: string
  ): Presentation {
    const pd: InternalPresentationDefinition =
      this.determineAndCastToInternalPresentationDefinition(presentationDefinition);
    const presentationSubmission = this._evaluationClientWrapper.submissionFrom(
      pd,
      SSITypesBuilder.mapExternalVerifiableCredentialsToInternal(selectedCredential)
    );
    return PEX.getPresentation(
      presentationSubmission,
      SSITypesBuilder.mapExternalVerifiableCredentialsToInternal(selectedCredential),
      holderDID
    );
  }

  public static getPresentation(
    presentationSubmission: PresentationSubmission,
    selectedCredential: InternalVerifiableCredential[],
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
      verifiableCredential: SSITypesBuilder.mapInternalVerifiableCredentialsToExternal(selectedCredential),
    };
  }

  /**
   * This method validates whether an object is usable as a presentation definition or not.
   *
   * @param presentationDefinition of V1 or v2 to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation definition
   */
  public validateDefinition(presentationDefinition: PresentationDefinitionV1 | PresentationDefinitionV2): Validated {
    const result = this.definitionVersionDiscovery(presentationDefinition);
    if (result.error) {
      throw result.error;
    }
    const validators = [];
    result.version === PEVersion.v1
      ? validators.push({
          bundler: new PresentationDefinitionV1VB('root'),
          target: presentationDefinition,
        })
      : validators.push({
          bundler: new PresentationDefinitionV2VB('root'),
          target: presentationDefinition,
        });
    return new ValidationEngine().validate(validators);
  }

  /**
   * This method validates whether an object is usable as a presentation definition or not.
   *
   * @param presentationDefinitionV2 the object to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation definition
   */
  public validateDefinitionV2(presentationDefinitionV2: PresentationDefinitionV2): Validated {
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
  public verifiablePresentationFrom(
    presentationDefinition: PresentationDefinitionV1,
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
    this.evaluateCredentials(
      presentationDefinition,
      SSITypesBuilder.mapExternalVerifiableCredentialsToInternal(selectedCredentials),
      holderDIDs,
      limitDisclosureSignatureSuites
    );

    const presentation = this.presentationFrom(
      presentationDefinition,
      SSITypesBuilder.mapExternalVerifiableCredentialsToInternal(selectedCredentials),
      holder
    );
    const evaluationResults = this.evaluatePresentation(
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

    const callBackParams: PresentationSignCallBackParams = {
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

  public definitionVersionDiscovery(presentationDefinition: PresentationDefinitionV1 | PresentationDefinitionV2): {
    version?: PEVersion;
    error?: string;
  } {
    const data = { presentation_definition: presentationDefinition };
    const ajv = new Ajv({ verbose: true, allowUnionTypes: true, allErrors: true });
    const validateV2 = ajv.compile(PresentationDefinitionSchema.getPresentationDefinitionSchemaV2());
    let result = validateV2(data);
    if (result) {
      return { version: PEVersion.v2 };
    }
    const validateV1 = ajv.compile(PresentationDefinitionSchema.getPresentationDefinitionSchemaV1());
    result = validateV1(data);
    if (result) {
      return { version: PEVersion.v1 };
    }
    return { error: 'This is not a valid PresentationDefinition' };
  }

  private determineAndCastToInternalPresentationDefinition(
    presentationDefinition: PresentationDefinitionV1 | PresentationDefinitionV2
  ): InternalPresentationDefinition {
    const versionResult: { version?: PEVersion; error?: string } =
      this.definitionVersionDiscovery(presentationDefinition);
    if (versionResult.error) throw versionResult.error;
    if (versionResult.version == PEVersion.v1) {
      return SSITypesBuilder.createInternalPresentationDefinitionV1FromModelEntity(
        presentationDefinition as PresentationDefinitionV1
      );
    }
    return SSITypesBuilder.createInternalPresentationDefinitionV2FromModelEntity(
      presentationDefinition as PresentationDefinitionV2
    );
  }
}
