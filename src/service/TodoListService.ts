import {ToDoList} from "../model/ToDoList";
import {NotFoundException} from "../exception/NotFoundException";

import {ToDoItem} from "../model/ToDoItem";
import {v4} from "uuid";
import {docClient} from "./DynamoDocumentClient";


const tableName = "TodoListsTable";

export async function fetchTodoListById(listId: string): Promise<ToDoList> {
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

export async function fetchAllTodoLists(): Promise<ToDoList[]> {
    const output = await docClient
        .scan({
            TableName: tableName
        })
        .promise();

    return output.Items as ToDoList[];
}

export async function saveTodoList(todoList: ToDoList): Promise<void> {
    await docClient
        .put({
            TableName: tableName,
            Item: todoList,
        })
        .promise();
}

export async function removeTodoList(listId: string): Promise<void> {
    await docClient
        .delete({
            TableName: tableName,
            Key: {
                listId: listId,
            },
        })
        .promise();
}

export function getMockTodoList(): ToDoList {
    const todoItem1 = new ToDoItem(v4(), "item1", false, '2022-07-06T18:24:00');
    const todoItem2 = new ToDoItem(v4(), "item2", false, '2022-07-06T18:24:00');
    const todoItem3 = new ToDoItem(v4(), "item3", true, '2022-06-06T18:24:00');
    return new ToDoList(v4(), 'list1', '2022-07-04T18:24:00', 'user1', '2022-07-06T18:24:00', [todoItem1, todoItem2, todoItem3]);
}