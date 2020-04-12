import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../../utils/logger';
import { S3Event } from 'aws-lambda';
import { inspect } from 'util';

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('todoAttachments');

export const handler = (event: S3Event) => {
    logger.info(`Received event input: ${inspect(event, { depth: null })}`);
    XAWS.S3Event;
}