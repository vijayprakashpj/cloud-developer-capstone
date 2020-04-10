import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { inspect } from 'util';

const logger = createLogger('createTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing createTodo request: ${inspect(event, {depth: null})}`);

  try {
    const newTodoRequest: CreateTodoRequest = JSON.parse(event.body);

    const newTodo = await createTodo(newTodoRequest, event);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTodo
      })
    };
  }
  catch(ex) {
    logger.error(`Unable to create the todo. Error: ${ex.toString()}`);
    return {
      statusCode: 500,
      body: `Unable to create the todo.`
    };
  }
})

handler.use(cors({
  credentials: true
}));