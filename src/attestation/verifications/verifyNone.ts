import base64url from 'base64url';

import { AttestationObject, VerifiedAttestation } from "@types";
import parseAttestationAuthData from "@helpers/parseAttestationAuthData";
import convertCOSEECDHAtoPKCS from "@helpers/convertCOSEECDHAtoPKCS";


export default function verifyAttestationNone(
  attestationObject: AttestationObject,
): VerifiedAttestation {
  const { fmt, authData } = attestationObject;
  const authDataStruct = parseAttestationAuthData(authData);

  console.log('authDataStruct:', authDataStruct);

  const {
    credentialID,
    COSEPublicKey,
    counter,
    flags,
  } = authDataStruct;

  if (!COSEPublicKey) {
    throw new Error('No public key was provided by authenticator');
  }

  if (!credentialID) {
    throw new Error('No credential ID was provided by authenticator');
  }

  // Make sure the (U)ser (P)resent for the attestation
  if (!flags.up) {
    console.error('User was not Present for attestation');
    console.debug('attestation\'s flags:', flags);
    throw new Error('User presence could not be verified');
  }

  if (!flags.uv) {
    console.warn('The authenticator could not uniquely Verify the user');
  }

  const publicKey = convertCOSEECDHAtoPKCS(COSEPublicKey);

  const toReturn: VerifiedAttestation = {
    verified: true,
    authenticatorInfo: {
      fmt,
      counter,
      base64PublicKey: base64url.encode(publicKey),
      base64CredentialID: base64url.encode(credentialID),
    },
  };

  return toReturn;
}