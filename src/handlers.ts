import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {v4} from "uuid";
import {ToDoList} from "./model/ToDoList";
import {ToDoItem} from "./model/ToDoItem";
import {NotFoundException} from "./exception/NotFoundException";
import * as yup from "yup";
import {fetchTodoListById, removeTodoList, saveTodoList} from "./service/TodoListService";
import {findItemInTodoList} from "./service/TodoItemService";

const defaultHeaders = {
    "content-type": "application/json",
};

export const hello = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log("EVENT:")
    console.log(event)

    console.log("CONTEXT");
    console.log(context);

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: "Go Serverless v1.0! Your function executed successfully!",
                input: event,
                context: context
            },
            null,
            2,
        ),
    };
};

/// manage ToDoList
const createTodoListRequestSchema = yup.object().shape({
    listName: yup.string().required(),
    deadlineDate: yup.string().required()
});

async function validateCreateTodoListRequest(event: APIGatewayProxyEvent): Promise<string> {
    const requestBody = JSON.parse(event.body as string);
    console.log(requestBody);
    await createTodoListRequestSchema.validate(requestBody, {abortEarly: false});

    return requestBody;
}

export const createTodoList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log("POST todo list");
        await validateCreateTodoListRequest(event);
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

export const updateTodoList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const listId = event.pathParameters?.listId as string;

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

/// manage ToDoItem
export const createTodoItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const listId = event.pathParameters?.listId as string;
    console.log("POST todo item for list with id " + listId);

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
}

export const updateTodoItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const listId = event.pathParameters?.listId as string;
        const itemId = event.pathParameters?.itemId as string;
        console.log("PUT todo item with id " + itemId + " for list with id " + listId);

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

function createTodoItemFromCreateRequest(event: APIGatewayProxyEvent): ToDoItem {
    const requestBody = JSON.parse(event.body as string);
    console.log(requestBody);

    const itemId = v4();
    const itemName = requestBody.itemName;
    const isDone = requestBody.isDone;
    const createDate = new Date().toISOString();

    return new ToDoItem(itemId, itemName, isDone, createDate);
}

function handleError(error: Error): APIGatewayProxyResult {
    if (error instanceof NotFoundException) {
        return {
            statusCode: error.statusCode,
            headers: defaultHeaders,
            body: error.responseBody
        }
    }

    if (error instanceof yup.ValidationError) {
        return {
            statusCode: 400,
            headers: defaultHeaders,
            body: JSON.stringify({
                errors: error.errors,
            }),
        };
    }

    if (error instanceof SyntaxError) {
        return {
            statusCode: 400,
            headers: defaultHeaders,
            body: JSON.stringify({error: `invalid request body format : "${error.message}"`}),
        };
    }
    throw error;
}