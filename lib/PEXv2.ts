import { Format, PresentationDefinitionV2, PresentationSubmission } from '@sphereon/pex-models';
import { IPresentation, OriginalVerifiableCredential, OriginalVerifiablePresentation } from '@sphereon/ssi-types';

import { PEX } from './PEX';
import { EvaluationClientWrapper, EvaluationResults, SelectResults } from './evaluation';
import { PresentationFromOpts, PresentationResult, PresentationSubmissionLocation } from './signing';
import { SSITypesBuilder } from './types';
import { PresentationDefinitionV2VB, Validated, ValidationEngine } from './validation';

/**
 * This is the main interfacing class to be used from outside the library to use the functionality provided by the library.
 */
export class PEXv2 extends PEX {
  constructor() {
    super();
  }

  /***
   * The evaluatePresentationV2 compares what is expected from a presentation with a presentationDefinitionV2.
   *
   * @param presentationDefinition the definition of what is expected in the presentation.
   * @param presentation the presentation which has to be evaluated in comparison of the definition.
   * @param opts - limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the presentation.
   */
  public evaluatePresentation(
    presentationDefinition: PresentationDefinitionV2,
    presentation: OriginalVerifiablePresentation | IPresentation,
    opts?: {
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
    },
  ): EvaluationResults {
    SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(presentationDefinition); // only doing validation
    return super.evaluatePresentation(presentationDefinition, presentation, opts);
  }

  /***
   * The evaluateCredentialsV2 compares what is expected from a verifiableCredentials with the presentationDefinitionV2.
   *
   * @param presentationDefinition the v2 definition of what is expected in the presentation.
   * @param verifiableCredentials the verifiable credentials which are candidates to fulfill requirements defined in the presentationDefinition param.
   * @param opts - holderDIDs the list of the DIDs that the wallet holders controlls.
   *              limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
   * were not fulfilled by the verifiable credentials.
   */
  public evaluateCredentials(
    presentationDefinition: PresentationDefinitionV2,
    verifiableCredentials: OriginalVerifiableCredential[],
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
    },
  ): EvaluationResults {
    SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(presentationDefinition); // only doing validation
    return super.evaluateCredentials(presentationDefinition, verifiableCredentials, opts);
  }

  /**
   * The selectFromV2 method is a helper function that helps filter out the verifiable credentials which can not be selected and returns
   * the selectable credentials.
   *
   * @param presentationDefinition the v2 definition of what is expected in the presentation.
   * @param verifiableCredentials verifiable credentials are the credentials from wallet provided to the library to find selectable credentials.
   * @param opts - holderDIDs the decentralized identity of the wallet holderDID. This is used to identify the credentials issued to the holderDID of wallet.
   *                limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
   *
   * @return the selectable credentials.
   */
  public selectFrom(
    presentationDefinition: PresentationDefinitionV2,
    verifiableCredentials: OriginalVerifiableCredential[],
    opts?: {
      holderDIDs?: string[];
      limitDisclosureSignatureSuites?: string[];
      restrictToFormats?: Format;
      restrictToDIDMethods?: string[];
    },
  ): SelectResults {
    this._evaluationClientWrapper = new EvaluationClientWrapper();
    return this._evaluationClientWrapper.selectFrom(
      SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(presentationDefinition),
      SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentials),
      opts,
    );
  }

  /**
   * This method helps create a Presentation. A Presentation after signing becomes a Verifiable Presentation and can be sent to
   * a verifier.
   *
   * @param presentationDefinition the v2 definition of what is expected in the presentation.
   * @param selectedCredentials the credentials which were declared selectable by getSelectableCredentials and then chosen by the intelligent-user
   * (e.g. human).
   * @param opts? - holderDID optional; the decentralized identifier of the Credential subject. This is used to identify the holderDID of the presentation.
   *
   * @return the presentation.
   */
  public presentationFrom(
    presentationDefinition: PresentationDefinitionV2,
    selectedCredentials: OriginalVerifiableCredential[],
    opts?: PresentationFromOpts,
  ): PresentationResult {
    const presentationSubmissionLocation = opts?.presentationSubmissionLocation ?? PresentationSubmissionLocation.PRESENTATION;
    const presentationSubmission = this._evaluationClientWrapper.submissionFrom(
      SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(presentationDefinition),
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
   * @param presentationDefinitionV2 the object to be validated.
   *
   * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation definition
   */
  public static validateDefinition(presentationDefinitionV2: PresentationDefinitionV2): Validated {
    const pd = SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(presentationDefinitionV2);
    return new ValidationEngine().validate([
      {
        bundler: new PresentationDefinitionV2VB('root'),
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
