import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import AWS from "aws-sdk";
import {v4} from "uuid";
import {ToDoList} from "./model/ToDoList";
import {ToDoItem} from "./model/ToDoItem";
import {NotFoundException} from "./exception/NotFoundException";
import * as yup from "yup";

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "TodoListsTable";
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

        await docClient
            .put({
                TableName: tableName,
                Item: todoList,
            })
            .promise();
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

        await docClient
            .put({
                TableName: tableName,
                Item: todoList,
            })
            .promise();

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

        await docClient
            .delete({
                TableName: tableName,
                Key: {
                    listId: listId,
                },
            })
            .promise();
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
function getMockTodoList(): ToDoList {
    const todoItem1 = new ToDoItem(v4(), "item1", false, '2022-07-06T18:24:00');
    const todoItem2 = new ToDoItem(v4(), "item2", false, '2022-07-06T18:24:00');
    const todoItem3 = new ToDoItem(v4(), "item3", true, '2022-06-06T18:24:00');
    return new ToDoList(v4(), 'list1', '2022-07-04T18:24:00', 'user1', '2022-07-06T18:24:00', [todoItem1, todoItem2, todoItem3]);
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

function createTodoItemFromCreateRequest(event: APIGatewayProxyEvent): ToDoItem {
    const requestBody = JSON.parse(event.body as string);
    console.log(requestBody);

    const itemId = v4();
    const itemName = requestBody.itemName;
    const isDone = requestBody.isDone;
    const createDate = new Date().toISOString();

    return new ToDoItem(itemId, itemName, isDone, createDate);
}

async function fetchTodoListById(listId: string): Promise<ToDoList> {
    const output = await docClient
        .get({
            TableName: tableName,
            Key: {
                listId: listId,
            },
        })
        .promise();

    if (!output.Item) {
        throw new NotFoundException("todoList", listId);
    }
    return output.Item as ToDoList;
}

async function fetchTodoItemById(listId: string, itemId: string): Promise<ToDoItem> {
    const todoList: ToDoList = await fetchTodoListById(listId);
    if (todoList.items == null || todoList.items.length == 0) {
        throw new NotFoundException("todoItem", itemId);
    }

    const foundItem = todoList.items.find(item => item.itemId === itemId);
    if (foundItem == null) {
        throw new NotFoundException("todoItem", itemId);
    } else {
        return foundItem;
    }
}

function findItemInTodoList(todoList: ToDoList, itemId: string): ToDoItem {
    if (todoList.items == null || todoList.items.length == 0) {
        throw new NotFoundException("todoItem", itemId);
    }

    const foundItem = todoList.items.find(item => item.itemId === itemId);
    if (foundItem == null) {
        throw new NotFoundException("todoItem", itemId);
    } else {
        return foundItem;
    }
}

async function saveTodoList(todoList: ToDoList): Promise<void> {
    await docClient
        .put({
            TableName: tableName,
            Item: todoList,
        })
        .promise();
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