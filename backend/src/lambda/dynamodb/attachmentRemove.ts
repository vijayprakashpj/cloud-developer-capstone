import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda';
import { inspect } from 'util';
import { createLogger } from '../../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS);
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

const logger = createLogger('attachmentRemove');

const ATTACHMENTS_BUCKET = process.env.ATTACHMENTS_BUCKET;

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    logger.info(`Request received by attachmentRemove function: ${inspect(event, { depth: null })}`);

    for (const record of event.Records) {
        logger.info(`Processing this message: ${JSON.stringify(record)}`);

        if (record.eventName !== 'REMOVE') {
            continue;
        }

        const todoId = record.dynamodb.Keys.todoId.S;

        s3.deleteObject({
            Bucket: ATTACHMENTS_BUCKET,
            Key: todoId
        })
    }
}
