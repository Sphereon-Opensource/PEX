import fs from 'fs';

function getFile(path: string) {
  return fs.readFileSync(path, 'utf-8');
}
export class JwtVcs {
  static getVCs(): string[] {
    const vc0 = getFile('./test/dif_pe_examples/vc/bachelorOfScienceAndArts-vc.jwt');
    const vc1 = getFile('./test/dif_pe_examples/vc/bachelorOfScieneAndArtDegree-vc.jwt');
    const vc2 = getFile('./test/dif_pe_examples/vc/nameCredential-vc.jwt');
    const vc3 = getFile('./test/dif_pe_examples/vc/qSARS-CoV-2-Rapid-Test-Credential.jwt');
    const vc4 = getFile('./test/dif_pe_examples/vc/qSARS-CoV-2-Travel-Badge-Credential.jwt');
    const vc5 = getFile('./test/dif_pe_examples/vc/vc_universityDegree.jwt');
    return [vc0, vc1, vc2, vc3, vc4, vc5];
  }
}
