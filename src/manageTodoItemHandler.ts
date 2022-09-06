/// create ToDoItem
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {ToDoList} from "./model/ToDoList";
import {fetchTodoListById, saveTodoList} from "./service/TodoListService";
import {ToDoItem} from "./model/ToDoItem";
import {v4} from "uuid";
import {findItemInTodoList} from "./service/TodoItemService";
import {defaultHeaders, handleError} from "./handlers";
import * as yup from "yup";

export const createTodoItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const listId = event.pathParameters?.listId as string;
        console.log("POST todo item for list with id " + listId);
        await validateTodoItemRequest(event);

        const todoList: ToDoList = await fetchTodoListById(listId);
        const creatingTodoItem = createTodoItemFromCreateRequest(event);
        // todoList.addItem(creatingTodoItem);

        if (todoList.items != null && todoList.items.length > 0) {
            todoList.items.push(creatingTodoItem);
        } else {
            todoList.items = [creatingTodoItem];
        }

        await saveTodoList(todoList);
        return {
            statusCode: 201,
            headers: defaultHeaders,
            body: JSON.stringify(todoList)
        }
    } catch (error) {
        return handleError(error);
    }
}

function createTodoItemFromCreateRequest(event: APIGatewayProxyEvent): ToDoItem {
    const requestBody = JSON.parse(event.body as string);
    console.log(requestBody);

    const itemId = v4();
    const itemName = requestBody.itemName;
    const isDone = requestBody.isDone;
    const createDate = new Date().toISOString();

    return new ToDoItem(itemId, itemName, isDone, createDate);
}

/// update ToDoItem
export const updateTodoItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const listId = event.pathParameters?.listId as string;
        const itemId = event.pathParameters?.itemId as string;
        console.log("PUT todo item with id " + itemId + " for list with id " + listId);
        await validateTodoItemRequest(event);

        const todoList = await fetchTodoListById(listId);
        const itemToUpdate = findItemInTodoList(todoList, itemId);

        const requestBody = JSON.parse(event.body as string);
        console.log(requestBody);
        const itemName = requestBody.itemName;
        const isDone = requestBody.isDone;

        itemToUpdate.name = itemName;
        itemToUpdate.isDone = isDone;

        await saveTodoList(todoList);
        return {
            statusCode: 200,
            headers: defaultHeaders,
            body: JSON.stringify(todoList)
        }
    } catch (error) {
        return handleError(error);
    }
}

/// delete ToDoItem
export const deleteTodoItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const listId = event.pathParameters?.listId as string;
        const itemId = event.pathParameters?.itemId as string;
        console.log("DELETE todo item with id " + itemId + " for list with id " + listId);

        const todoList = await fetchTodoListById(listId);
        const itemToDelete = findItemInTodoList(todoList, itemId);

        const index = todoList.items?.indexOf(itemToDelete, 0);
        // @ts-ignore
        todoList.items.splice(index, 1);

        await saveTodoList(todoList);
        return {
            statusCode: 204,
            body: ""
        }
    } catch (error) {
        return handleError(error);
    }
}

/// private methods
const todoItemRequestSchema = yup.object().shape({
    itemName: yup.string().required(),
    isDone: yup.boolean().required()
});

async function validateTodoItemRequest(event: APIGatewayProxyEvent): Promise<string> {
    const requestBody = JSON.parse(event.body as string);
    console.log(requestBody);
    await todoItemRequestSchema.validate(requestBody, {abortEarly: false});

    return requestBody;
}