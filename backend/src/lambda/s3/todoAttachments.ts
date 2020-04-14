import { createLogger } from '../../utils/logger';
import { SQSEvent, S3Event } from 'aws-lambda';
import { inspect } from 'util';
import { updateAttachmentUrl } from '../../businessLogic/todos';
import { getAttachmentUrl } from '../utils';

const logger = createLogger('todoAttachments');
const attachmentsBucket = process.env.ATTACHMENTS_BUCKET;

export const handler = (event: SQSEvent) => {
    logger.info(`Received event input: ${inspect(event, { depth: null })}`);

    for (const record of event.Records) {
        const s3Event: S3Event = JSON.parse(record.body);
        for (const s3Record of s3Event.Records) {
            logger.info(`Processing S3 event: ${inspect(s3Record, { depth: null })}`);
            const key: string = s3Record.s3.object.key;
            const eventName: string = s3Record.eventName;

            if (eventName.startsWith("ObjectCreated")) {
                updateAttachmentUrl(key, getAttachmentUrl(key, attachmentsBucket));
            } else if (eventName.startsWith("ObjectRemoved")) {
                updateAttachmentUrl(key, getAttachmentUrl(key, null));
            }
        }
    }
}