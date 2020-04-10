import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { deleteTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { inspect } from 'util';
import * as AWS from 'aws-sdk';
import * as AWSXray from 'aws-xray-sdk';

const XAWS = AWSXray.captureAWS(AWS);
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

const logger = createLogger('deleteTodo');

const attachmentsBucket = process.env.ATTACHMENTS_BUCKET;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing deleteTodo request for ${inspect(event, {depth: null})}`);

  const todoId = event.pathParameters.todoId;
  try {
    await deleteAttachment(todoId);
    await deleteTodo(todoId, event);

    return {
      statusCode: 200,
      body: ''
    };
  }
  catch (ex) {
    logger.error(`Unable to delete ${todoId}. Error: ${ex.toString()}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Unable to delete the todo item'
      })
    }
  }
})

handler.use(cors({
  credentials: true
}));

const deleteAttachment = async (todoId) => {
  s3.deleteObject({
    Bucket: attachmentsBucket,
    Key: todoId
  }).promise();
}