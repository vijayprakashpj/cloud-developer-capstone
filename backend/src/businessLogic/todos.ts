import { TodoAccess } from '../dataLayer/todoAccess';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { getUserId } from '../lambda/utils';
import * as uuid from 'uuid';
import { APIGatewayProxyEvent, APIGatewayEvent } from 'aws-lambda';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todoAccess = new TodoAccess();

export const createTodo = async (todoRequest: CreateTodoRequest, event: APIGatewayProxyEvent) => {
  const userId: string = getUserId(event);

  const todo: TodoItem = {
    todoId: uuid.v4(),
    userId: userId,
    name: todoRequest.name,
    dueDate: todoRequest.dueDate,
    attachmentUrl: todoRequest.attachmentUrl,
    createdAt: new Date().toISOString(),
    done: false
  }

  return await todoAccess.createTodo(todo);
}

export const getTodos = async (event: APIGatewayEvent) : Promise<TodoItem[]> => {
  const userId: string = getUserId(event);
  const allTodos: TodoItem[]= await todoAccess.getTodos(userId);

  return allTodos;
}

export const deleteTodo = async (todoId: string, event: APIGatewayEvent) => {
  const userId: string = getUserId(event);
  const todoExists = await todoAccess.todoExists(todoId, userId);
  if (!todoExists) {
    throw new Error(`Todo (${todoId}) not found`);
  }

  await todoAccess.deleteTodo(todoId, userId);
}

export const updateTodo = async (todoId: string, updateTodoRequest: UpdateTodoRequest, event: APIGatewayEvent) => {
  const userId: string = getUserId(event);
  const todoToUpdate = await todoAccess.getTodo(todoId, userId);

  if (!todoToUpdate) {
    throw new Error(`Todo (${todoId}) not found`);
  }

  todoToUpdate.name = updateTodoRequest.name;
  todoToUpdate.dueDate = updateTodoRequest.dueDate;
  todoToUpdate.done = updateTodoRequest.done;

  await todoAccess.updateTodo(todoId, userId, todoToUpdate);
}

export const updateAttachmentUrl = async (todoId: string, attachmentUrl: string, event: APIGatewayEvent) => {
  const userId = getUserId(event);
  const todo = await todoAccess.getTodo(todoId, userId);

  if (!todo) {
    throw new Error(`Todo (${todoId}) not found`);
  }

  todo.attachmentUrl = attachmentUrl;

  await todoAccess.updateTodo(todoId, userId, todo);
}