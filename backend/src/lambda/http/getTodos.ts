import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getTodos } from '../../businessLogic/todos';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createLogger } from '../../utils/logger';

const logger = createLogger('getTodos');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing getTodos request for event: ${event}`);

  try {
    const allTodos = await getTodos(event);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: allTodos
      })
    }
  }
  catch(ex) {
    logger.info(`Unable to fetch todos. Error: ${ex.toString()}`);
    return {
      statusCode: 500,
      body: `Unable to fetch todos`
    }
  }
})

handler.use(cors({
  credentials: true
}));