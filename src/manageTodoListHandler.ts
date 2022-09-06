import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {fetchAllTodoLists, fetchTodoListById, removeTodoList, saveTodoList} from "./service/TodoListService";
import {ToDoList} from "./model/ToDoList";
import {v4} from "uuid";
import {defaultHeaders, handleError} from "./handlers";
import * as yup from "yup";

// create ToDoList
export const createTodoList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log("POST todo list");
        await validateTodoListRequest(event);
        const todoList = createTodoListFromCreateRequest(event);

        await saveTodoList(todoList);
        return {
            statusCode: 201,
            headers: defaultHeaders,
            body: JSON.stringify(todoList, null, 2)
        };
    } catch (error) {
        return handleError(error);
    }
}

function createTodoListFromCreateRequest(event: APIGatewayProxyEvent): ToDoList {
    const requestBody = JSON.parse(event.body as string);
    console.log(requestBody);

    const listId = v4();
    const name = requestBody.listName;
    const deadlineDate = requestBody.deadlineDate;
    const userId = "user_" + v4(); //TODO get user from request
    const createDate = new Date().toISOString();

    return new ToDoList(listId, name, deadlineDate, userId, createDate, []);
}

// get All ToDoLists
export const getAllTodoLists = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log("GET all todo lists");

        const todoList = await fetchAllTodoLists();
        return {
            statusCode: 200,
            headers: defaultHeaders,
            body: JSON.stringify(todoList)
        }
    } catch (error) {
        return handleError(error);
    }
}

// get ToDoList
export const getTodoList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const listId = event.pathParameters?.listId as string;
        console.log("GET todo list with id " + listId);

        const todoList = await fetchTodoListById(listId);
        return {
            statusCode: 200,
            headers: defaultHeaders,
            body: JSON.stringify(todoList)
        }
    } catch (error) {
        return handleError(error);
    }
}

// update ToDoList
export const updateTodoList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const listId = event.pathParameters?.listId as string;
        console.log("PUT todo item for list with id " + listId);
        await validateTodoListRequest(event);

        const todoList = await fetchTodoListById(listId);
        const requestBody = JSON.parse(event.body as string);
        console.log(requestBody);
        const name = requestBody.listName;
        const deadlineDate = requestBody.deadlineDate;

        todoList.name = name;
        todoList.deadlineDate = deadlineDate;

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

// delete ToDoList
export const deleteTodoList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const listId = event.pathParameters?.listId as string;
        console.log("DELETE todo list with id " + listId);

        await fetchTodoListById(listId);

        await removeTodoList(listId);
        return {
            statusCode: 204,
            body: ""
        }
    } catch (error) {
        return handleError(error);
    }
}

/// private methods
const todoListRequestSchema = yup.object().shape({
    listName: yup.string().required(),
    deadlineDate: yup.string().required()
});

async function validateTodoListRequest(event: APIGatewayProxyEvent): Promise<string> {
    const requestBody = JSON.parse(event.body as string);
    console.log(requestBody);
    await todoListRequestSchema.validate(requestBody, {abortEarly: false});

    return requestBody;
}