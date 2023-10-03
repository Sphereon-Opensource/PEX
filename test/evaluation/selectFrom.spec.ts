import fs from 'fs';

import { Rules } from '@sphereon/pex-models';
import { IVerifiableCredential, WrappedVerifiableCredential } from '@sphereon/ssi-types';

import { Status } from '../../lib';
import { EvaluationClientWrapper } from '../../lib/evaluation';
import { InternalPresentationDefinitionV1, SSITypesBuilder } from '../../lib/types';
import PexMessages from '../../lib/types/Messages';

function getFile(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const dids = ['did:example:ebfeb1f712ebc6f1c276e12ec21'];

const LIMIT_DISCLOSURE_SIGNATURE_SUITES = ['BbsBlsSignatureProof2020'];

describe('selectFrom tests', () => {
  it('Evaluate submission requirements all from group A', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![0]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    expect(
      evaluationClientWrapper.selectFrom(pd, wvcs, { holderDIDs: dids, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES }),
    ).toEqual({
      areRequiredCredentialsPresent: Status.INFO,
      errors: [],
      matches: [
        {
          from: 'A',
          vc_path: ['$.verifiableCredential[0]', '$.verifiableCredential[1]', '$.verifiableCredential[2]'],
          name: 'Submission of educational transcripts',
          rule: 'all',
        },
      ],
      verifiableCredential: [
        {
          iss: 'did:example:123',
          FIXME: 'THIS DOESNT MAKE SENSE. The is a decoded JWT as an object in the array. It should just be a JWT VC as string',
          vc: {
            '@context': 'https://eu.com/claims/DriversLicense',
            credentialSubject: {
              accounts: [
                {
                  id: '1234567890',
                  route: 'DE-9876543210',
                },
                {
                  id: '2457913570',
                  route: 'DE-0753197542',
                },
              ],
              id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
            },
            id: 'https://eu.com/claims/DriversLicense',
            issuanceDate: '2010-01-01T19:73:24Z',
            issuer: 'did:example:123',
            type: ['EUDriversLicense'],
          },
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'EcdsaSecp256k1VerificationKey2019',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
        },
        {
          '@context': 'https://business-standards.org/schemas/employment-history.json',
          credentialSubject: {
            active: true,
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
          },
          id: 'https://business-standards.org/schemas/employment-history.json',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'EcdsaSecp256k1VerificationKey2019',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['VerifiableCredential', 'GenericEmploymentCredential'],
        },
        {
          '@context': 'https://www.w3.org/2018/credentials/v1',
          credentialSubject: {
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
            license: {
              dob: '07/13/80',
              number: '34DGE352',
            },
          },
          id: 'https://eu.com/claims/DriversLicense',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'RsaSignature2018',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['EUDriversLicense'],
        },
      ],
      warnings: [],
    });
  });

  it('Evaluate without submission requirements', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    delete pdSchema.submission_requirements;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const result = evaluationClientWrapper.selectFrom(pd, wvcs, {
      holderDIDs: dids,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result.matches?.length).toBe(3);
    expect(result.areRequiredCredentialsPresent).toBe(Status.INFO);
  });

  it('Evaluate submission requirements min 2 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![1]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    expect(
      evaluationClientWrapper.selectFrom(pd, wvcs, { holderDIDs: dids, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES }),
    ).toEqual({
      areRequiredCredentialsPresent: Status.INFO,
      errors: [],
      matches: [
        {
          from: 'B',
          vc_path: ['$.verifiableCredential[0]', '$.verifiableCredential[1]'],
          min: 2,
          name: 'Submission of educational transcripts',
          rule: 'pick',
        },
      ],
      verifiableCredential: [
        {
          '@context': 'https://business-standards.org/schemas/employment-history.json',
          credentialSubject: {
            active: true,
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
          },
          id: 'https://business-standards.org/schemas/employment-history.json',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'EcdsaSecp256k1VerificationKey2019',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['VerifiableCredential', 'GenericEmploymentCredential'],
        },
        {
          '@context': 'https://www.w3.org/2018/credentials/v1',
          credentialSubject: {
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
            license: {
              dob: '07/13/80',
              number: '34DGE352',
            },
          },
          id: 'https://eu.com/claims/DriversLicense',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'RsaSignature2018',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['EUDriversLicense'],
        },
      ],
      warnings: [],
    });
  });

  it('Evaluate submission requirements either all from group A or 2 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![2]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    const result = evaluationClientWrapper.selectFrom(pd, wvcs, {
      holderDIDs: dids,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result.areRequiredCredentialsPresent).toEqual(Status.WARN);
    expect(result.errors?.length).toEqual(16);
  });

  it('Evaluate submission requirements max 2 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![3]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    expect(
      evaluationClientWrapper.selectFrom(pd, wvcs, { holderDIDs: dids, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES }),
    ).toEqual({
      areRequiredCredentialsPresent: Status.INFO,
      errors: [],
      matches: [
        {
          from: 'B',
          vc_path: ['$.verifiableCredential[0]', '$.verifiableCredential[1]'],
          max: 2,
          name: 'Submission of educational transcripts',
          rule: 'pick',
        },
      ],
      verifiableCredential: [
        {
          '@context': 'https://business-standards.org/schemas/employment-history.json',
          credentialSubject: {
            active: true,
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
          },
          id: 'https://business-standards.org/schemas/employment-history.json',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'EcdsaSecp256k1VerificationKey2019',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['VerifiableCredential', 'GenericEmploymentCredential'],
        },
        {
          '@context': 'https://www.w3.org/2018/credentials/v1',
          credentialSubject: {
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
            license: {
              dob: '07/13/80',
              number: '34DGE352',
            },
          },
          id: 'https://eu.com/claims/DriversLicense',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'RsaSignature2018',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['EUDriversLicense'],
        },
      ],
      warnings: [],
    });
  });

  it('Evaluate submission requirements all from group A and 2 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![8]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    expect(
      evaluationClientWrapper.selectFrom(pd, wvcs, { holderDIDs: dids, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES }),
    ).toEqual({
      areRequiredCredentialsPresent: Status.INFO,
      errors: [],
      matches: [
        {
          from_nested: [
            {
              from: 'A',
              vc_path: ['$.verifiableCredential[0]', '$.verifiableCredential[1]', '$.verifiableCredential[2]'],
              name: 'Submission of educational transcripts',
              rule: 'all',
            },
            {
              count: 2,
              from: 'B',
              vc_path: ['$.verifiableCredential[1]', '$.verifiableCredential[2]'],
              name: 'Submission of educational transcripts',
              rule: 'pick',
            },
          ],
          vc_path: [],
          name: '32f54163-7166-48f1-93d8-ff217bdb0653',
          rule: 'all',
        },
      ],
      verifiableCredential: [
        {
          FIXME: 'THIS DOESNT MAKE SENSE. The is a decoded JWT as an object in the array. It should just be a JWT VC as string',
          iss: 'did:example:123',
          vc: {
            '@context': 'https://eu.com/claims/DriversLicense',
            credentialSubject: {
              accounts: [
                {
                  id: '1234567890',
                  route: 'DE-9876543210',
                },
                {
                  id: '2457913570',
                  route: 'DE-0753197542',
                },
              ],
              id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
            },
            id: 'https://eu.com/claims/DriversLicense',
            issuanceDate: '2010-01-01T19:73:24Z',
            issuer: 'did:example:123',
            type: ['EUDriversLicense'],
          },
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'EcdsaSecp256k1VerificationKey2019',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
        },
        {
          '@context': 'https://business-standards.org/schemas/employment-history.json',
          credentialSubject: {
            active: true,
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
          },
          id: 'https://business-standards.org/schemas/employment-history.json',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'EcdsaSecp256k1VerificationKey2019',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['VerifiableCredential', 'GenericEmploymentCredential'],
        },
        {
          '@context': 'https://www.w3.org/2018/credentials/v1',
          credentialSubject: {
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
            license: {
              dob: '07/13/80',
              number: '34DGE352',
            },
          },
          id: 'https://eu.com/claims/DriversLicense',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'RsaSignature2018',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['EUDriversLicense'],
        },
      ],
      warnings: [],
    });
  });

  it('Evaluate submission requirements min 1: (all from group A or 2 from group B)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![9]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    expect(
      evaluationClientWrapper.selectFrom(pd, wvcs, { holderDIDs: dids, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES }),
    ).toEqual({
      areRequiredCredentialsPresent: Status.INFO,
      errors: [],
      matches: [
        {
          from_nested: [
            {
              from: 'A',
              vc_path: ['$.verifiableCredential[0]', '$.verifiableCredential[1]', '$.verifiableCredential[2]'],
              name: 'Submission of educational transcripts',
              rule: 'all',
            },
            {
              count: 2,
              from: 'B',
              vc_path: ['$.verifiableCredential[1]', '$.verifiableCredential[2]'],
              name: 'Submission of educational transcripts',
              rule: 'pick',
            },
          ],
          vc_path: [],
          min: 1,
          name: '32f54163-7166-48f1-93d8-ff217bdb0653',
          rule: 'pick',
        },
      ],
      verifiableCredential: [
        {
          iss: 'did:example:123',
          FIXME: 'THIS DOESNT MAKE SENSE. The is a decoded JWT as an object in the array. It should just be a JWT VC as string',
          vc: {
            '@context': 'https://eu.com/claims/DriversLicense',
            credentialSubject: {
              accounts: [
                {
                  id: '1234567890',
                  route: 'DE-9876543210',
                },
                {
                  id: '2457913570',
                  route: 'DE-0753197542',
                },
              ],
              id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
            },
            id: 'https://eu.com/claims/DriversLicense',
            issuanceDate: '2010-01-01T19:73:24Z',
            issuer: 'did:example:123',
            type: ['EUDriversLicense'],
          },
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'EcdsaSecp256k1VerificationKey2019',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
        },
        {
          '@context': 'https://business-standards.org/schemas/employment-history.json',
          credentialSubject: {
            active: true,
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
          },
          id: 'https://business-standards.org/schemas/employment-history.json',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'EcdsaSecp256k1VerificationKey2019',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['VerifiableCredential', 'GenericEmploymentCredential'],
        },
        {
          '@context': 'https://www.w3.org/2018/credentials/v1',
          credentialSubject: {
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
            license: {
              dob: '07/13/80',
              number: '34DGE352',
            },
          },
          id: 'https://eu.com/claims/DriversLicense',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'RsaSignature2018',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['EUDriversLicense'],
        },
      ],
      warnings: [],
    });
  });

  it('Evaluate submission requirements max 2: (all from group A and 2 from group B)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![10]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    expect(
      evaluationClientWrapper.selectFrom(pd, wvcs, { holderDIDs: dids, limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES }),
    ).toEqual({
      areRequiredCredentialsPresent: Status.INFO,
      errors: [],
      matches: [
        {
          from_nested: [
            {
              from: 'A',
              vc_path: ['$.verifiableCredential[0]', '$.verifiableCredential[1]', '$.verifiableCredential[2]'],
              name: 'Submission of educational transcripts',
              rule: 'all',
            },
            {
              count: 2,
              from: 'B',
              vc_path: ['$.verifiableCredential[1]', '$.verifiableCredential[2]'],
              name: 'Submission of educational transcripts',
              rule: 'pick',
            },
          ],
          vc_path: [],
          max: 2,
          name: '32f54163-7166-48f1-93d8-ff217bdb0653',
          rule: 'pick',
        },
      ],
      verifiableCredential: [
        {
          iss: 'did:example:123',
          FIXME: 'THIS DOESNT MAKE SENSE. The is a decoded JWT as an object in the array. It should just be a JWT VC as string',
          vc: {
            '@context': 'https://eu.com/claims/DriversLicense',
            credentialSubject: {
              accounts: [
                {
                  id: '1234567890',
                  route: 'DE-9876543210',
                },
                {
                  id: '2457913570',
                  route: 'DE-0753197542',
                },
              ],
              id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
            },
            id: 'https://eu.com/claims/DriversLicense',
            issuanceDate: '2010-01-01T19:73:24Z',
            issuer: 'did:example:123',
            type: ['EUDriversLicense'],
          },
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'EcdsaSecp256k1VerificationKey2019',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
        },
        {
          '@context': 'https://business-standards.org/schemas/employment-history.json',
          credentialSubject: {
            active: true,
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
          },
          id: 'https://business-standards.org/schemas/employment-history.json',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'EcdsaSecp256k1VerificationKey2019',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['VerifiableCredential', 'GenericEmploymentCredential'],
        },
        {
          '@context': 'https://www.w3.org/2018/credentials/v1',
          credentialSubject: {
            id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
            license: {
              dob: '07/13/80',
              number: '34DGE352',
            },
          },
          id: 'https://eu.com/claims/DriversLicense',
          issuanceDate: '2010-01-01T19:73:24Z',
          issuer: 'did:foo:123',
          proof: {
            created: '2017-06-18T21:19:10Z',
            jws: '...',
            proofPurpose: 'assertionMethod',
            type: 'RsaSignature2018',
            verificationMethod: 'https://example.edu/issuers/keys/1',
          },
          type: ['EUDriversLicense'],
        },
      ],
      warnings: [],
    });
  });

  it('Evaluate submission requirements min 3 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![4]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    const result = evaluationClientWrapper.selectFrom(pd, wvcs, {
      holderDIDs: dids,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result.areRequiredCredentialsPresent).toBe(Status.ERROR);
    expect(result.errors).toEqual([
      {
        tag: 'UriEvaluation',
        status: 'error',
        message: PexMessages.URI_EVALUATION_DIDNT_PASS + ': $.input_descriptors[0]: $.verifiableCredential[1]',
      },
      {
        tag: 'UriEvaluation',
        status: 'error',
        message: PexMessages.URI_EVALUATION_DIDNT_PASS + ': $.input_descriptors[0]: $.verifiableCredential[2]',
      },
      {
        tag: 'UriEvaluation',
        status: 'error',
        message: PexMessages.URI_EVALUATION_DIDNT_PASS + ': $.input_descriptors[1]: $.verifiableCredential[0]',
      },
      {
        tag: 'UriEvaluation',
        status: 'error',
        message: PexMessages.URI_EVALUATION_DIDNT_PASS + ': $.input_descriptors[1]: $.verifiableCredential[2]',
      },
      {
        tag: 'UriEvaluation',
        status: 'error',
        message: PexMessages.URI_EVALUATION_DIDNT_PASS + ': $.input_descriptors[2]: $.verifiableCredential[0]',
      },
      {
        tag: 'UriEvaluation',
        status: 'error',
        message: PexMessages.URI_EVALUATION_DIDNT_PASS + ': $.input_descriptors[2]: $.verifiableCredential[1]',
      },
      {
        tag: 'FilterEvaluation',
        status: 'error',
        message: PexMessages.INPUT_CANDIDATE_FAILED_FILTER_EVALUATION + ': $.input_descriptors[1]: $.verifiableCredential[0]',
      },
      {
        tag: 'FilterEvaluation',
        status: 'error',
        message: PexMessages.INPUT_CANDIDATE_FAILED_FILTER_EVALUATION + ': $.input_descriptors[2]: $.verifiableCredential[0]',
      },
      {
        tag: 'FilterEvaluation',
        status: 'error',
        message: PexMessages.INPUT_CANDIDATE_FAILED_FILTER_EVALUATION + ': $.input_descriptors[0]: $.verifiableCredential[1]',
      },
      {
        tag: 'FilterEvaluation',
        status: 'error',
        message: PexMessages.INPUT_CANDIDATE_FAILED_FILTER_EVALUATION + ': $.input_descriptors[0]: $.verifiableCredential[2]',
      },
      {
        tag: 'MarkForSubmissionEvaluation',
        status: 'error',
        message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION + ': $.input_descriptors[0]: $.verifiableCredential[1]',
      },
      {
        tag: 'MarkForSubmissionEvaluation',
        status: 'error',
        message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION + ': $.input_descriptors[0]: $.verifiableCredential[2]',
      },
      {
        tag: 'MarkForSubmissionEvaluation',
        status: 'error',
        message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION + ': $.input_descriptors[1]: $.verifiableCredential[0]',
      },
      {
        tag: 'MarkForSubmissionEvaluation',
        status: 'error',
        message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION + ': $.input_descriptors[1]: $.verifiableCredential[2]',
      },
      {
        tag: 'MarkForSubmissionEvaluation',
        status: 'error',
        message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION + ': $.input_descriptors[2]: $.verifiableCredential[0]',
      },
      {
        tag: 'MarkForSubmissionEvaluation',
        status: 'error',
        message: PexMessages.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION + ': $.input_descriptors[2]: $.verifiableCredential[1]',
      },
    ]);
    expect(result.matches).toEqual([
      {
        from: 'B',
        vc_path: ['$.verifiableCredential[0]', '$.verifiableCredential[1]'],
        min: 3,
        name: 'Submission of educational transcripts',
        rule: 'pick',
      },
    ]);
  });

  it('Evaluate submission requirements max 1 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![5]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    const result = evaluationClientWrapper.selectFrom(pd, wvcs, {
      holderDIDs: dids,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result.matches).toEqual([
      {
        from: 'B',
        vc_path: ['$.verifiableCredential[0]', '$.verifiableCredential[1]'],
        max: 1,
        name: 'Submission of educational transcripts',
        rule: 'pick',
      },
    ]);
    expect(result.errors?.length).toEqual(16);
    expect(result.verifiableCredential?.length).toEqual(3);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.WARN);
  });

  it('Evaluate submission requirements exactly 1 from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![6]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    const result = evaluationClientWrapper.selectFrom(pd, wvcs, {
      holderDIDs: dids,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result.matches?.length).toEqual(1);
    expect(result.verifiableCredential?.length).toEqual(3);
    expect(result.errors?.length).toEqual(16);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.WARN);
  });

  it('Evaluate submission requirements all from group B', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![7]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    const result = evaluationClientWrapper.selectFrom(pd, wvcs, {
      holderDIDs: dids,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result.errors?.length).toEqual(0);
    expect(result.matches?.length).toEqual(1);
    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
    expect(result.verifiableCredential?.length).toEqual(2);
  });

  it('Evaluate submission requirements min 3: (all from group A or 2 from group B + unexistent)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![11]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    pd.submission_requirements![0].min = 1;
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    const result = evaluationClientWrapper.selectFrom(pd, wvcs, {
      holderDIDs: dids,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
    expect(result.matches?.length).toEqual(1);
    expect(result.matches![0]).toEqual({
      from_nested: [
        {
          from: 'A',
          name: 'Submission of educational transcripts',
          rule: Rules.All,
          vc_path: ['$.verifiableCredential[0]', '$.verifiableCredential[1]', '$.verifiableCredential[2]'],
        },
        {
          count: 2,
          from: 'B',
          name: 'Submission of educational transcripts',
          rule: Rules.Pick,
          vc_path: ['$.verifiableCredential[1]', '$.verifiableCredential[2]'],
        },
      ],
      min: 1,
      name: '32f54163-7166-48f1-93d8-ff217bdb0653',
      rule: Rules.Pick,
      vc_path: [],
    });
  });

  it('Evaluate submission requirements max 1: (all from group A and 2 from group B)', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/resources/sr_rules.json').presentation_definition;
    const vpSimple = getFile('./test/dif_pe_examples/vp/vp_general.json');
    pdSchema!.submission_requirements = [pdSchema!.submission_requirements![12]];
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([
      vpSimple.verifiableCredential[0],
      vpSimple.verifiableCredential[1],
      vpSimple.verifiableCredential[2],
    ]);
    const result = evaluationClientWrapper.selectFrom(pd, wvcs, {
      holderDIDs: dids,
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result.areRequiredCredentialsPresent).toEqual(Status.WARN);
    expect(result.matches).toEqual([
      {
        from_nested: [
          {
            from: 'A',
            vc_path: ['$.verifiableCredential[0]', '$.verifiableCredential[1]', '$.verifiableCredential[2]'],
            name: 'Submission of educational transcripts',
            rule: 'all',
          },
          {
            count: 2,
            from: 'B',
            vc_path: ['$.verifiableCredential[1]', '$.verifiableCredential[2]'],
            name: 'Submission of educational transcripts',
            rule: 'pick',
          },
        ],
        vc_path: [],
        name: '32f54163-7166-48f1-93d8-ff217bdb0653',
        rule: 'pick',
        max: 1,
      },
    ]);
    expect(result.errors?.length).toEqual(16);
  });

  it('Evaluate case without presentation submission', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/dif_pe_examples/pdV1/pd-PermanentResidentCard.json').presentation_definition;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const verifiableCredential = getFile('./test/dif_pe_examples/vc/vc-PermanentResidentCard.json');
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([verifiableCredential]);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const result = evaluationClientWrapper.selectFrom(pd, wvcs, {
      holderDIDs: ['FAsYneKJhWBP2n5E21ZzdY'],
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result!.errors!.length).toEqual(0);
    expect(result!.matches![0]!.name).toEqual("EU Driver's License");
    expect(result!.matches![0]).toEqual({
      name: "EU Driver's License",
      rule: 'all',
      vc_path: ['$.verifiableCredential[0]'],
    });
  });

  it('Evaluate driver license name result', () => {
    const pdSchema: InternalPresentationDefinitionV1 = getFile('./test/dif_pe_examples/pdV1/pd_driver_license_name.json')
      .presentation_definition as InternalPresentationDefinitionV1;
    const pd = SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(pdSchema);
    const verifiableCredential: IVerifiableCredential = getFile('./test/dif_pe_examples/vc/vc-driverLicense.json') as IVerifiableCredential;
    const wvcs: WrappedVerifiableCredential[] = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs([verifiableCredential]);
    const evaluationClientWrapper: EvaluationClientWrapper = new EvaluationClientWrapper();
    const result = evaluationClientWrapper.selectFrom(pd, wvcs, {
      holderDIDs: ['FAsYneKJhWBP2n5E21ZzdY'],
      limitDisclosureSignatureSuites: LIMIT_DISCLOSURE_SIGNATURE_SUITES,
    });
    expect(result!.errors!.length).toEqual(0);
    expect(result!.matches![0]!.name).toEqual("EU Driver's License");
  });
});
