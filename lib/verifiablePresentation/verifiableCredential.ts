/***
 * Verifiable credentials: are the individual credentials issued by issuing authority e.g. DrivingLicence, CollegeDegree etc.
 */
export interface VerifiableCredential {
  id: string;
  credentialSubject: unknown;
  type: string;
}
