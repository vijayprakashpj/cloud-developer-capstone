import * as JwksClient from 'jwks-rsa-promisified';

export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token;
}

export async function getSecret(jwksUrl: string, jwksKid: string) : Promise<string> {
  // Hit JWKS Url and look for the correct key to be used
  const jwksClient = JwksClient({
    jwksUri: jwksUrl,
    strictSsl: true
  });

  const signingKey = await jwksClient.getSigningKeyAsync(jwksKid);

  return signingKey.publicKey || signingKey.rsaPublicKey;
}