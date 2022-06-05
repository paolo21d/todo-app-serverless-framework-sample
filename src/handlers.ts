import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import AWS from "aws-sdk";
import {v4} from "uuid";
import {ToDoList} from "./model/ToDoList";
import {ToDoItem} from "./model/ToDoItem";

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "TodoListsTable";
const defaultHeaders = {
    "content-type": "application/json",
};

export const hello = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: "Go Serverless v1.0! Your function executed successfully!",
                input: event,
            },
            null,
            2,
        ),
    };
};

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

export const createTodoList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // const todoList = getMockTodoList();
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
}

export const getTodoList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const listId = event.pathParameters?.listId;
    console.log("GET todo list with id " + listId);

    const output = await docClient
        .get({
            TableName: tableName,
            Key: {
                listId: listId,
            },
        })
        .promise();

    const todoList = output.Item as ToDoList;
    // if (!output.Item) {
    //     throw new HttpError(404, { error: "not found" });
    // }

    return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify(todoList)
    }
}

export const updateTodoList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const listId = event.pathParameters?.listId;
    return {
        statusCode: 501,
        headers: defaultHeaders,
        body: "Unimplemented"
    }
}

export const deleteTodoList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const listId = event.pathParameters?.listId;
    return {
        statusCode: 501,
        headers: defaultHeaders,
        body: "Unimplemented"
    }
}