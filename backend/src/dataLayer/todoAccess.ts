import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { TodoItem } from '../models/TodoItem';

const XAWS = AWSXRay.captureAWS(AWS);

export class TodoAccess {

  constructor(
    private readonly dynamoDBClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODOS_TABLE_NAME,
    private readonly todoIndex = process.env.TODOS_USERID_INDEX_NAME,
  ) {}

  public createTodo = async (todo: TodoItem) : Promise<TodoItem> => {
    await this.dynamoDBClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise();

    return todo;
  }

  public getTodo = async (todoId: string, userId: string) : Promise<TodoItem> => {
    const result = await this.dynamoDBClient.get({
      TableName: this.todoTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }).promise();

    return result.Item as TodoItem;
  }

  public todoExists = async (todoId: string, userId: string) : Promise<boolean> => {
    const result = await this.getTodo(todoId, userId);
    console.log(`Todo Exists?: ${result}`);
    return !!result;
  }

  public getTodos = async (userId: string) : Promise<TodoItem[]> => {
    const result = await this.dynamoDBClient.query({
      TableName: this.todoTable,
      IndexName: this.todoIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();

    const allTodos = result.Items;
    return allTodos as TodoItem[]
  }

  public getTodoById = async (todoId: string) : Promise<TodoItem> => {
    const result = await this.dynamoDBClient.query({
      TableName: this.todoTable,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      }
    }).promise();

    return result.Items[0] as TodoItem;
  }

  public deleteTodo = async (todoId: string, userId: string) => {
    await this.dynamoDBClient.delete({
      TableName: this.todoTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }).promise();
  }

  public updateTodo = async (todoId: string, userId: string, todo: TodoItem) => {
    await this.dynamoDBClient.update({
      TableName: this.todoTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'SET #name = :name, #dueDate = :dueDate, #done = :done, #attachmentUrl = :attachmentUrl',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done',
        '#attachmentUrl': 'attachmentUrl'
      },
      ExpressionAttributeValues: {
        ':name': todo.name,
        ':dueDate': todo.dueDate,
        ':done': todo.done,
        ':attachmentUrl': todo.attachmentUrl || null
      }
    }).promise();
  }

  public updateTodoAttachmentUrl = async (todoId: string, attachmentUrl: string) => {
    await this.dynamoDBClient.update({
      TableName: this.todoTable,
      Key: {
        todoId: todoId
      },
      UpdateExpression: 'SET #attachmentUrl = :attachmentUrl',
      ExpressionAttributeNames: {
        '#attachmentUrl': 'attachmentUrl'
      },
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl || null
      }
    }).promise();
  }
}

const createDynamoDBClient = () => {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance');
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      convertEmptyValues: true
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}