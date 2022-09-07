import {APIGatewayProxyEvent} from "aws-lambda";
import {createTodoItem, deleteTodoItem, updateTodoItem} from "../../src/manageTodoItemHandler";
import {fetchTodoListById, saveTodoList} from "../../src/service/TodoListService";
import {APIGatewayProxyEventPathParameters} from "aws-lambda/trigger/api-gateway-proxy";
import {NotFoundException} from "../../src/exception/NotFoundException";
import {ToDoList} from "../../src/model/ToDoList";
import {ToDoItem} from "../../src/model/ToDoItem";

jest.mock("../../src/service/TodoListService");
const fetchTodoListByIdMock = fetchTodoListById as jest.Mock;
const saveTodoListMock = saveTodoList as jest.Mock;

describe("ManageTodoItemHandler.createTodoItem", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Validate request - empty body", async () => {
        // given
        const body = {};
        const requestEvent = {
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;
        // when
        const result = await createTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(400);

        expect(fetchTodoListByIdMock).toBeCalledTimes(0);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Validate request - not present itemName", async () => {
        // given
        const body = {isDone: true};
        const requestEvent = {
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;
        // when
        const result = await createTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(400);

        expect(fetchTodoListByIdMock).toBeCalledTimes(0);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Validate request - not present isDone", async () => {
        // given
        const body = {itemName: "itemName"};
        const requestEvent = {
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;
        // when
        const result = await createTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(400);

        expect(fetchTodoListByIdMock).toBeCalledTimes(0);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Adding item to not existing todo list", async () => {
        // given
        const listId = "notExistingListId";
        const body = {itemName: "itemName", isDone: true};
        const requestEvent = {
            pathParameters: {listId} as APIGatewayProxyEventPathParameters,
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;

        fetchTodoListByIdMock.mockImplementation(() => {
            throw new NotFoundException("todoList", listId)
        })
        // when
        const result = await createTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(404);

        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Adding item to todo list with items list null", async () => {
        // given
        const newItemName = "newItemName";
        const newItemIsDone = true;

        const todoList = getSampleTodoList();
        todoList.items = null;

        const body = {itemName: newItemName, isDone: newItemIsDone};
        const requestEvent = {
            pathParameters: {listId: todoList.listId} as APIGatewayProxyEventPathParameters,
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;

        fetchTodoListByIdMock.mockResolvedValue(JSON.parse(JSON.stringify(todoList)));
        // when
        const result = await createTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(201);
        expect(result.body).toBeDefined();

        const resultTodoList = JSON.parse(result.body) as ToDoList;
        expect(resultTodoList.listId).toBe(todoList.listId);
        expect(resultTodoList.name).toBe(todoList.name);
        expect(resultTodoList.deadlineDate).toBe(todoList.deadlineDate);
        expect(resultTodoList.createDate).toBe(todoList.createDate);
        expect(resultTodoList.userId).toBe(todoList.userId);

        expect(resultTodoList.items?.length).toBe(1);
        const resultCreatedItem = resultTodoList.items?.[0] as ToDoItem;
        expect(resultCreatedItem.itemId).toBeDefined();
        expect(resultCreatedItem.createDate).toBeDefined();
        expect(resultCreatedItem.name).toBe(newItemName);
        expect(resultCreatedItem.isDone).toBe(newItemIsDone);

        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(saveTodoListMock).toBeCalledTimes(1);
    });

    test("Adding item to todo list with empty items list", async () => {
        // given
        const newItemName = "newItemName";
        const newItemIsDone = true;

        const todoList = getSampleTodoList();
        todoList.items = [];

        const body = {itemName: newItemName, isDone: newItemIsDone};
        const requestEvent = {
            pathParameters: {listId: todoList.listId} as APIGatewayProxyEventPathParameters,
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;

        fetchTodoListByIdMock.mockResolvedValue(JSON.parse(JSON.stringify(todoList)));
        // when
        const result = await createTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(201);
        expect(result.body).toBeDefined();

        const resultTodoList = JSON.parse(result.body) as ToDoList;
        expect(resultTodoList.listId).toBe(todoList.listId);
        expect(resultTodoList.name).toBe(todoList.name);
        expect(resultTodoList.deadlineDate).toBe(todoList.deadlineDate);
        expect(resultTodoList.createDate).toBe(todoList.createDate);
        expect(resultTodoList.userId).toBe(todoList.userId);

        expect(resultTodoList.items?.length).toBe(1);
        const resultCreatedItem = resultTodoList.items?.[0] as ToDoItem;
        expect(resultCreatedItem.itemId).toBeDefined();
        expect(resultCreatedItem.createDate).toBeDefined();
        expect(resultCreatedItem.name).toBe(newItemName);
        expect(resultCreatedItem.isDone).toBe(newItemIsDone);

        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(saveTodoListMock).toBeCalledTimes(1);
    });

    test("Adding item to todo list with not empty items list", async () => {
        // given
        const newItemName = "newItemName";
        const newItemIsDone = true;

        const todoList = getSampleTodoList();

        const body = {itemName: newItemName, isDone: newItemIsDone};
        const requestEvent = {
            pathParameters: {listId: todoList.listId} as APIGatewayProxyEventPathParameters,
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;

        fetchTodoListByIdMock.mockResolvedValue(JSON.parse(JSON.stringify(todoList)));
        // when
        const result = await createTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(201);
        expect(result.body).toBeDefined();

        const resultTodoList = JSON.parse(result.body) as ToDoList;
        expect(resultTodoList.listId).toBe(todoList.listId);
        expect(resultTodoList.name).toBe(todoList.name);
        expect(resultTodoList.deadlineDate).toBe(todoList.deadlineDate);
        expect(resultTodoList.createDate).toBe(todoList.createDate);
        expect(resultTodoList.userId).toBe(todoList.userId);

        expect(resultTodoList.items?.length).toBe(4);
        const resultCreatedItem = resultTodoList.items?.[3] as ToDoItem;
        expect(resultCreatedItem.itemId).toBeDefined();
        expect(resultCreatedItem.createDate).toBeDefined();
        expect(resultCreatedItem.name).toBe(newItemName);
        expect(resultCreatedItem.isDone).toBe(newItemIsDone);

        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(saveTodoListMock).toBeCalledTimes(1);
    });
});

describe("ManageTodoItemHandler.updateTodoItem", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Validate request - empty body", async () => {
        // given
        const body = {};
        const requestEvent = {
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;
        // when
        const result = await updateTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(400);

        expect(fetchTodoListByIdMock).toBeCalledTimes(0);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Validate request - not present itemName", async () => {
        // given
        const body = {isDone: true};
        const requestEvent = {
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;
        // when
        const result = await updateTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(400);

        expect(fetchTodoListByIdMock).toBeCalledTimes(0);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Validate request - not present isDone", async () => {
        // given
        const body = {itemName: "itemName"};
        const requestEvent = {
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;
        // when
        const result = await updateTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(400);

        expect(fetchTodoListByIdMock).toBeCalledTimes(0);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Updating item of not existing todo list", async () => {
        // given
        const listId = "notExistingListId";
        const body = {itemName: "itemName", isDone: true};
        const requestEvent = {
            pathParameters: {listId} as APIGatewayProxyEventPathParameters,
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;

        fetchTodoListByIdMock.mockImplementation(() => {
            throw new NotFoundException("todoList", listId)
        })
        // when
        const result = await updateTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(404);

        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Updating not existing item in existing todo list", async () => {
        // given
        const itemId = "notExistingItemId";

        const newItemName = "newItemName";
        const newItemIsDone = true;

        const todoList = getSampleTodoList();
        const body = {itemName: newItemName, isDone: newItemIsDone};
        const requestEvent = {
            pathParameters: {listId: todoList.listId, itemId} as APIGatewayProxyEventPathParameters,
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;

        fetchTodoListByIdMock.mockResolvedValue(todoList);
        // when
        const result = await updateTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(404);

        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Updated item", async () => {
        // given
        const updatedItemName = "updatedItemName";
        const updatedItemIsDone = true;

        const todoList = getSampleTodoList();
        const updatingItem = getSampleTodoList().items?.[0] as ToDoItem;

        const body = {itemName: updatedItemName, isDone: updatedItemIsDone};
        const requestEvent = {
            pathParameters: {
                listId: todoList.listId,
                itemId: updatingItem.itemId
            } as APIGatewayProxyEventPathParameters,
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;

        fetchTodoListByIdMock.mockResolvedValue(JSON.parse(JSON.stringify(todoList)));
        // when
        const result = await updateTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(200);
        expect(result.body).toBeDefined();

        const resultTodoList = JSON.parse(result.body) as ToDoList;
        expect(resultTodoList.listId).toBe(todoList.listId);
        expect(resultTodoList.name).toBe(todoList.name);
        expect(resultTodoList.deadlineDate).toBe(todoList.deadlineDate);
        expect(resultTodoList.createDate).toBe(todoList.createDate);
        expect(resultTodoList.userId).toBe(todoList.userId);

        expect(resultTodoList.items?.length).toBe(3);
        const resultUpdatedItem = resultTodoList.items?.[0] as ToDoItem;
        expect(resultUpdatedItem.itemId).toBe(updatingItem.itemId);
        expect(resultUpdatedItem.createDate).toBe(updatingItem.createDate);
        expect(resultUpdatedItem.name).toBe(updatedItemName);
        expect(resultUpdatedItem.isDone).toBe(updatedItemIsDone);

        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(saveTodoListMock).toBeCalledTimes(1);
    });
});

describe("ManageTodoItemHandler.deleteTodoItem", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Deleting item of not existing todo list", async () => {
        // given
        const listId = "notExistingListId";
        const itemId = "itemId";
        const requestEvent = {
            pathParameters: {listId, itemId} as APIGatewayProxyEventPathParameters,
        } as APIGatewayProxyEvent;

        fetchTodoListByIdMock.mockImplementation(() => {
            throw new NotFoundException("todoList", listId)
        })
        // when
        const result = await deleteTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(404);

        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Deleting not existing item in existing todo list", async () => {
        // given
        const itemId = "notExistingItemId";

        const todoList = getSampleTodoList();
        const requestEvent = {
            pathParameters: {listId: todoList.listId, itemId} as APIGatewayProxyEventPathParameters,
        } as APIGatewayProxyEvent;

        fetchTodoListByIdMock.mockResolvedValue(todoList);
        // when
        const result = await deleteTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(404);

        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Deleted item from todo list", async () => {
        // given
        const todoList = getSampleTodoList();
        const deletingItem = todoList.items?.[0] as ToDoItem;

        const requestEvent = {
            pathParameters: {
                listId: todoList.listId,
                itemId: deletingItem.itemId
            } as APIGatewayProxyEventPathParameters,
        } as APIGatewayProxyEvent;
        fetchTodoListByIdMock.mockResolvedValue(todoList);
        // when
        const result = await deleteTodoItem(requestEvent);
        // then
        expect(result.statusCode).toBe(204);

        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(fetchTodoListByIdMock).toBeCalledWith(todoList.listId);

        expect(saveTodoListMock).toBeCalledTimes(1);
        expect(saveTodoListMock.mock.calls.length).toBe(1);
        const resultSavingTodoList = saveTodoListMock.mock.calls[0][0] as ToDoList;
        expect(resultSavingTodoList.items?.length).toBe(2);
        expect(resultSavingTodoList.items?.[0].itemId as string).not.toBe(deletingItem.itemId);
        expect(resultSavingTodoList.items?.[1].itemId as string).not.toBe(deletingItem.itemId);
    });
});

function getSampleTodoList(): ToDoList {
    const todoItem1 = new ToDoItem("idItem1", "item1", false, '2022-07-06T18:24:00');
    const todoItem2 = new ToDoItem("idItem2", "item2", false, '2022-07-06T18:24:00');
    const todoItem3 = new ToDoItem("idItem3", "item3", true, '2022-06-06T18:24:00');
    return new ToDoList("idList1", 'list1', '2022-07-04T18:24:00', 'user1', '2022-07-06T18:24:00', [todoItem1, todoItem2, todoItem3]);
}