import 'source-map-support/register'
import * as AWS  from 'aws-sdk';
import * as AWSXRay  from 'aws-xray-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { createLogger } from '../../utils/logger';
import { inspect } from 'util';

const XAWS = AWSXRay.captureAWS(AWS);
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

const logger = createLogger('generateUploadUrl');

const attachmentsBucket = process.env.ATTACHMENTS_BUCKET;
const signedUrlExpiry = parseInt(process.env.SIGNED_URL_EXPIRATION);

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing generateUploadUrl request for ${inspect(event, {depth: null})}`);
  try {
    const todoId = event.pathParameters.todoId;
    const uploadUrl = getS3SignedUrl(todoId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        'uploadUrl': uploadUrl
      })
    };
  }
  catch(ex) {
    logger.error(`Unable to generate upload url. Error: ${ex.toString()}`);
    return {
      statusCode: 500,
      body: 'Unable to generate upload url'
    }
  }
});

handler.use(cors({
  credentials: true
}))

const getS3SignedUrl = (todoId: string) => {
  return s3.getSignedUrl('putObject', {
    Bucket: attachmentsBucket,
    Key: todoId,
    Expires: signedUrlExpiry
  });
}