import { VerifiableCredential } from '../../verifiablePresentation';

import { Data } from './data';

export interface Wallet {
  data: Data;
  verifiableCredentials?: VerifiableCredential[];
}
