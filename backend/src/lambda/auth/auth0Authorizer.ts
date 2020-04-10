import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { getToken, getSecret } from './utils';
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
import * as middy from 'middy';
import { secretsManager } from 'middy/middlewares';

const logger = createLogger('auth')

const jwksSecretId = process.env.AUTH0_SECRET_ID;

export const handler = middy(async (
  event: CustomAuthorizerEvent,
  context: any
): Promise<CustomAuthorizerResult> => {
  logger.info(`Authorizing a user: ${event.authorizationToken}`);
  const jwksKid = context.AUTH0_SECRET[process.env.AUTH0_SECRET_KID_FIELD];
  const jwksUrl = context.AUTH0_SECRET[process.env.AUTH0_SECRET_JWKS_URL_FIELD];

  try {
    const jwtToken = await verifyToken(event.authorizationToken, jwksUrl, jwksKid)
    logger.info(`User was authorized: ${jwtToken}`);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error(`User not authorized: ${e.message}`)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  }
})

async function verifyToken(authHeader: string, jwksUrl: string, jwksKid: string): Promise<JwtPayload> {
  if (!authHeader) {
    throw new Error('No authentication header');
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header');
  }

  const token = getToken(authHeader);
  const secret = await getSecret(jwksUrl, jwksKid);

  return verify(token, secret) as JwtPayload;
}


handler.use(
  secretsManager({
    cache: true,
    cacheExpiryInMillis: 60000,
    awsSdkOptions: { region: 'eu-central-1' },
    throwOnFailedCall: true,
    secrets: {
      AUTH0_SECRET: jwksSecretId
    }
  })
);