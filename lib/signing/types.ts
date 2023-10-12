import {
  Format,
  PresentationDefinitionV1,
  PresentationDefinitionV2,
  PresentationSubmission
} from '@sphereon/pex-models';
import {
  IPresentation,
  IProof,
  IProofPurpose,
  IProofType,
  OriginalVerifiableCredential,
  W3CVerifiablePresentation
} from '@sphereon/ssi-types';

import { EvaluationResults } from '../evaluation';

export interface ProofOptions {
  /**
   * The signature type. For instance RsaSignature2018
   */
  type?: IProofType | string;

  /**
   * Type supports selective disclosure?
   */
  typeSupportsSelectiveDisclosure?: boolean;

  /**
   * A challenge protecting against replay attacks
   */
  challenge?: string;

  /**
   * A domain protecting against replay attacks
   */
  domain?: string;

  /**
   * The purpose of this proof, for instance assertionMethod or authentication, see https://www.w3.org/TR/vc-data-model/#proofs-signatures-0
   */
  proofPurpose?: IProofPurpose | string;

  /**
   * The ISO8601 date-time string for creation. You can update the Proof value later in the callback. If not supplied the current date/time will be used
   */
  created?: string;

  /**
   * Similar to challenge. A nonce to protect against replay attacks, used in some ZKP proofs
   */
  nonce?: string;
}

export interface SignatureOptions {
  /**
   * The private key
   */
  privateKey?: string;

  /**
   * Key encoding
   */
  keyEncoding?: KeyEncoding;

  /**
   * The verification method value
   */
  verificationMethod?: string;

  /**
   * Can be used if you want to provide the Json-ld proof value directly without relying on the callback function generating it
   */
  proofValue?: string; // One of any number of valid representations of proof values

  /**
   * Can be used if you want to provide the JSW proof value directly without relying on the callback function generating it
   */
  jws?: string; // JWS based proof
}

/**
 * The location of the presentation submission. Can be external or part of the VP
 */
export enum PresentationSubmissionLocation {
  EXTERNAL, // External to the VP, for instance to use it in OID4VP
  PRESENTATION, // Part of the VP itself
}

/**
 * The result object containing the presentation and presentation submission
 */
export interface PresentationResult {
  /**
   * The resulting presentation(s), can have an embedded submission data depending on the location parameter
   */
  presentation: IPresentation | IPresentation[];

  /**
   * The resulting location of the presentation submission.
   * Please note that this result object will always also put the submission in the presentationSubmission property, even if it is also embedded in the Verifiable Presentation
   */
  presentationSubmissionLocation: PresentationSubmissionLocation;

  /**
   * The presentation submission.
   * Please note that this property will always be populated, even if it is also embedded in the Verifiable Presentation. If you need to determine the location, use the presentationSubmissionLocation property
   */
  presentationSubmission: PresentationSubmission;
}

/**
 * The result object containing the VP and presentation submission
 */
export interface VerifiablePresentationResult {
  /**
   * The resulting VP, can have an embedded submission data depending on the location parameter
   */
  verifiablePresentation: W3CVerifiablePresentation;

  /**
   * The resulting location of the presentation submission.
   * Please note that this result object will always also put the submission in the presentationSubmission property, even if it is also embedded in the Verifiable Presentation
   */
  presentationSubmissionLocation: PresentationSubmissionLocation;

  /**
   * The presentation submission.
   * Please note that this property will always be populated, even if it is also embedded in the Verifiable Presentation. If you need to determine the location, use the presentationSubmissionLocation property
   */
  presentationSubmission: PresentationSubmission;
}

/**
 * Whether the input results in a single presentation, always in multiple presentations, or whether it takes the type of presentation and amount of holder DIDs into account
 */
export enum PresentationResultType {
  SINGLE_PRESENTATION, // single presentation with potentially multiple proofs/signatures (does not work for regular JWTs)
  MULTIPLE_PRESENTATIONS, // Always create separate VPs. Not compatible with presentation submissions internal to the VP, can only be used with external
  VP_FORMAT_BASED // Determines whether there is one holder DID, then create a single VP. If there are multiple holder DIDs, it will create a single VP for LDP/JSON-ld VPs, but multiple for JWT VPs. Auto mode requires a format for the presentation

}

export interface PresentationConstruction {

  /**
   * The format that the presentation should be in (not necessarily influences the encoding of methods using these options, but always influences logic, like for instance the result type handling)
   */
  presentationFormat?: Format;

  /**
   * Whether the input results in a single presentation, always in multiple presentations, or whether it takes the type of presentation and amount of holder DIDs into account
   */
  presentationResultType: PresentationResultType;

  /**
   * The optional holderDID of the presentation. If used it will be the sole holder DID of any resulting presentation, regardless of subject DIDs from VCs
   *
   * If you have multiple presentations and want to provide multiple holder DIDs, then you should use basePresentationPayload to pre-fill values corresponding to the presentation.
   * This option is incompatible with multiple presentations and as a result an error will be thrown
   *
   */
  holderDID?: string;

  /**
   * The presentation submission data location.
   *
   * Can be External, which means it is only returned and not embedded into the VP,
   * or Presentation, which means it will become part of the VP
   */
  presentationSubmissionLocation: PresentationSubmissionLocation;

  credentials: Set<OriginalVerifiableCredential>
  jwtVCCount: number
  ldpVCCount: number
}

export interface PresentationFromOpts<PayloadType extends Partial<IPresentation> | Partial<IPresentation>[]> {
  /**
   * The format that the presentation should be in (not necessarily influences the encoding of methods using these options, but always influences logic, like for instance the result type handling)
   */
  presentationFormat?: Format;

  /**
   * Whether the input results in a single presentation, always in multiple presentations, or whether it takes the type of presentation and amount of holder DIDs into account
   */
  presentationResultType?: PresentationResultType;

  /**
   * The optional holderDID of the presentation. If used it will be the sole holder DID of any resulting presentation, regardless of subject DIDs from VCs
   *
   * If you have multiple presentations and want to provide multiple holder DIDs, then you should use basePresentationPayload to pre-fill values corresponding to the presentation.
   * This option is incompatible with multiple presentations and as a result an error will be thrown
   *
   */
  holderDID?: string;

  /**
   * The presentation submission data location.
   *
   * Can be External, which means it is only returned and not embedded into the VP,
   * or Presentation, which means it will become part of the VP
   */
  presentationSubmissionLocation?: PresentationSubmissionLocation;

  /**
   * A base presentation payload. Can be used to provide default values. Be aware that any verifiable credential's proofs will always be overwritten here.
   *
   * If multiple presentations are supplied, the logic needs to be able to match Presentations it created to the payloads, so probably at least the holder property should be filled
   */
  basePresentationPayload?: PayloadType;
}

export interface VerifiablePresentationFromOpts extends PresentationFromOpts<Partial<IPresentation>|Partial<IPresentation>[]> {
  /**
   * Proof options
   */
  proofOptions?: ProofOptions;

  /**
   * The signature options
   */
  signatureOptions?: SignatureOptions;
}

export interface PresentationSignCallBackParams {
  /**
   * The originally supplied presentation sign options
   */
  options: VerifiablePresentationFromOpts;

  /**
   * The selected credentials to include in the eventual VP as determined by PEX and/or user
   */
  selectedCredentials: OriginalVerifiableCredential[];

  /**
   * The presentation object created from the definition and verifiable credentials.
   * Can be used directly or in more complex situations can be discarded by using the definition, credentials, proof options, submission and evaluation results
   */
  presentation: IPresentation;

  /**
   * A partial proof value the callback can use to complete. If proofValue or JWS was supplied the proof could be complete already
   */
  proof: Partial<IProof>;

  /**
   * The presentation definition
   */
  presentationDefinition: PresentationDefinitionV1 | PresentationDefinitionV2;

  /**
   * The presentation submission data, which can also be found in the presentation itself depending on the location param
   */
  presentationSubmission: PresentationSubmission;

  /**
   * The evaluation results, which the callback function could use to create a VP using the proof(s) using the supplied credentials
   */
  evaluationResults: EvaluationResults;
}

export enum KeyEncoding {
  Jwk = 'Jwk',
  Base58 = 'Base58',
  Hex = 'Hex',
  Multibase = 'Multibase',
}
