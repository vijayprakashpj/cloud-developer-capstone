import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { updateTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { inspect } from 'util';

const logger = createLogger('updateTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing updateTodo request for ${inspect(event, {depth: null})}`);

  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

  try {
    await updateTodo(todoId, updatedTodo, event);

    return {
      statusCode: 200,
      body: ''
    };
  }
  catch (ex) {
    logger.error(`Unable to update ${todoId}. Error: ${ex.toString()}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Unable to update the todo item'
      })
    }
  }
})

handler.use(cors({
  credentials: true
}));