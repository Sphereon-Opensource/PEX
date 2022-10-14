import { PresentationDefinitionV1, PresentationDefinitionV2, PresentationSubmission } from '@sphereon/pex-models';
import { IPresentation, IProof, IProofPurpose, IProofType, OriginalVerifiableCredential } from '@sphereon/ssi-types';

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

export interface PresentationSignOptions {
  /**
   * The optional holder of the presentation
   */
  holder?: string;

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
  options: PresentationSignOptions;

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
   * The presentation submission data, which can also be found in the presentation itself
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
