import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../../utils/logger';
import { S3EventRecord, SQSEvent } from 'aws-lambda';
import { inspect } from 'util';

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('todoAttachments');

export const handler = (event: SQSEvent) => {
    logger.info(`Received event input: ${inspect(event, { depth: null })}`);
    
    for(let record in event['Records']) {
        logger.info(record['Body'] as S3EventRecord);
    }
    XAWS.S3EventRecord;
}