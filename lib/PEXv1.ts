import { Format, PresentationDefinitionV1, PresentationSubmission } from '@sphereon/pex-models';
import { IPresentation, OriginalVerifiableCredential, OriginalVerifiablePresentation } from '@sphereon/ssi-types';

import { PEX } from './PEX';
import { EvaluationClientWrapper, EvaluationResults, SelectResults } from './evaluation';
import { PresentationFromOpts, PresentationResult, PresentationSubmissionLocation } from './signing';
import { SSITypesBuilder } from './types';
import { PresentationDefinitionV1VB, Validated, ValidationEngine } from './validation';

/**
 * This is the main interfacing class for using this library for v1 of presentation exchange
 */
export class PEXv1 extends PEX {
  constructor() {
    super();
  }

  /***
   * The evaluatePresentationV1 compares what is expected from a presentation with a presentationDefinitionV1.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param presentation the presentation which has to be evaluated in comparison of the definition.
   * @param opts - limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the presentation.
   */
  public evaluatePresentation(
    presentationDefinition: PresentationDefinitionV1,
    presentation: OriginalVerifiablePresentation | IPresentation,
    opts?: {
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
    },
  ): EvaluationResults {
    SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition); // only doing validation
    return super.evaluatePresentation(presentationDefinition, presentation, opts);
  }

  /***
   * To evaluate compares what is expected from a verifiableCredentials with the presentationDefinition.
   *
   * @param presentationDefinition the v1 definition of what is expected in the presentation.
   * @param verifiableCredentials the verifiable credentials which are candidates to fulfill requirements defined in the presentationDefinition param.
   * @param opts - holderDIDs the list of the DIDs that the wallet holders controlls.
   *                limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the verifiable credentials.
   */
  public evaluateCredentials(
    presentationDefinition: PresentationDefinitionV1,
    verifiableCredentials: OriginalVerifiableCredential[],
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
    },
  ): EvaluationResults {
    SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition); // only doing validation
    return super.evaluateCredentials(presentationDefinition, verifiableCredentials, opts);
  }

  /**
   * The selectFrom method is a helper function that helps filter out the verifiable credentials which can not be selected and returns
   * the selectable credentials.
   *
   * @param presentationDefinition the v1 definition of what is expected in the presentation.
   * @param verifiableCredentials verifiable credentials are the credentials from wallet provided to the library to find selectable credentials.
   * @param opts - holderDIDs the decentralized identity of the wallet holderDID. This is used to identify the credentials issued to the holderDID of wallet.
   *               limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the selectable credentials.
   */
  public selectFrom(
    presentationDefinition: PresentationDefinitionV1,
    verifiableCredentials: OriginalVerifiableCredential[],
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
    },
  ): SelectResults {
    const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.selectFrom(
      SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition),
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentialCopy),
      opts,
    );
  }

  /**
   * This method helps create a submittablePresentation. A submittablePresentation after signing becomes a Presentation. And can be sent to
   * the verifier after signing it.
   *
   * IMPORTANT NOTE: this method creates a presentation object based on the SELECTED verifiable credentials. You can get the selected verifiable credentials using selectFrom method
   *
   * @param presentationDefinition the v1 definition of what is expected in the presentation.
   * @param selectedCredentials the credentials which were declared selectable by getSelectableCredentials and then chosen by the intelligent-user
   * (e.g. human).
   * @param opts - holderDID optional; the decentralized identity of the wallet holderDID. This is used to identify the holderDID of the presentation.
   *
   * @return the presentation.
   */
  public presentationFrom(
    presentationDefinition: PresentationDefinitionV1,
    selectedCredentials: OriginalVerifiableCredential[],
    opts?: PresentationFromOpts,
  ): PresentationResult {
    const presentationSubmissionLocation = opts?.presentationSubmissionLocation ?? PresentationSubmissionLocation.PRESENTATION;
    const presentationSubmission = this._evaluationClientWrapper.submissionFrom(
      SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition),
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(selectedCredentials),
      opts,
    );
    const presentation = PEX.constructPresentation(selectedCredentials, {
      ...opts,
      presentationSubmission: presentationSubmissionLocation === PresentationSubmissionLocation.PRESENTATION ? presentationSubmission : undefined,
    });
    return {
      presentation,
      presentationSubmissionLocation,
      presentationSubmission,
    };
  }

  /**
   * This method validates whether an object is usable as a presentation definition or not.
   *
   * @param presentationDefinitionV1 the object to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation definition
   */
  public static validateDefinition(presentationDefinitionV1: PresentationDefinitionV1): Validated {
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinitionV1);
    return new ValidationEngine().validate([
      {
        bundler: new PresentationDefinitionV1VB('root'),
        target: pd,
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
  public static validateSubmission(presentationSubmission: PresentationSubmission): Validated {
    return PEX.validateSubmission(presentationSubmission);
  }
}
