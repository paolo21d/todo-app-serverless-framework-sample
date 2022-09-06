import {
    createTodoList,
    deleteTodoList,
    getAllTodoLists,
    getTodoList,
    updateTodoList
} from "../../src/manageTodoListHandler";
import {APIGatewayProxyEvent} from "aws-lambda";
import {fetchAllTodoLists, fetchTodoListById, removeTodoList, saveTodoList} from "../../src/service/TodoListService";
import {ToDoList} from "../../src/model/ToDoList";
import {ToDoItem} from "../../src/model/ToDoItem";
import {APIGatewayProxyEventPathParameters} from "aws-lambda/trigger/api-gateway-proxy";
import {NotFoundException} from "../../src/exception/NotFoundException";

jest.mock("../../src/service/TodoListService");
const saveTodoListMock = saveTodoList as jest.Mock;
const fetchAllTodoListsMock = fetchAllTodoLists as jest.Mock;
const fetchTodoListByIdMock = fetchTodoListById as jest.Mock;
const removeTodoListMock = removeTodoList as jest.Mock;

describe("ManageTodoListHandler.createTodoList", () => {
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
        const response = await createTodoList(requestEvent);
        // then
        expect(response.statusCode).toBe(400);

        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Validate request - not present listName", async () => {
        // given
        const body = {deadlineDate: "2022-07-06T18:24:00"};
        const requestEvent = {
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;
        // when
        const response = await createTodoList(requestEvent);
        // then
        expect(response.statusCode).toBe(400);

        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Validate request - not present deadlineDate", async () => {
        // given
        const body = {listName: "listName"};
        const requestEvent = {
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;
        // when
        const response = await createTodoList(requestEvent);
        // then
        expect(response.statusCode).toBe(400);

        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Created todo list", async () => {
        // given
        const listName = "listName";
        const deadlineDate = "2022-07-06T18:24:00";
        const body = {listName, deadlineDate};
        const requestEvent = {
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;
        saveTodoListMock.mockImplementation((creatingTodoList) => creatingTodoList);
        // when
        const result = await createTodoList(requestEvent);
        // then
        expect(result.statusCode).toBe(201);
        expect(result.body).toBeDefined();

        expect(saveTodoListMock).toBeCalledTimes(1);

        const resultTodoList = JSON.parse(result.body) as ToDoList;
        expect(resultTodoList.listId).toBeDefined();
        expect(resultTodoList.name).toBe(listName);
        expect(resultTodoList.deadlineDate).toBe(deadlineDate);
        expect(resultTodoList.createDate).toBeDefined();
        expect(resultTodoList.userId).toBeDefined();
    });
});

describe("ManageTodoListHandler.getAllTodoLists", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Return no todo lists", async () => {
        // given
        fetchAllTodoListsMock.mockResolvedValue([]);
        // when
        const result = await getAllTodoLists({} as APIGatewayProxyEvent);
        // then
        expect(result.statusCode).toBe(200);
        expect(result.body).toBe("[]");

        expect(fetchAllTodoListsMock).toBeCalledTimes(1);
    });

    test("Return todo lists", async () => {
        // given
        const todoLists = [getSampleTodoList(), getSampleTodoList()];
        fetchAllTodoListsMock.mockResolvedValue(todoLists);
        // when
        const result = await getAllTodoLists({} as APIGatewayProxyEvent);
        // then
        expect(result.statusCode).toBe(200);

        expect(result.body).toBeDefined();
        const resultTodoLists = JSON.parse(result.body);
        expect(resultTodoLists).toEqual(todoLists);

        expect(fetchAllTodoListsMock).toBeCalledTimes(1);
    });
});

describe("ManageTodoListHandler.getTodoList", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Not found todo list and return 404 status code", async () => {
        // given
        const listId = "listId";
        const requestEvent = {
            pathParameters: {listId} as APIGatewayProxyEventPathParameters
        } as APIGatewayProxyEvent;
        fetchTodoListByIdMock.mockImplementation(() => {
            throw new NotFoundException("todoList", listId)
        });
        // when
        const result = await getTodoList(requestEvent);
        // then
        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(fetchTodoListByIdMock).toBeCalledWith(listId);

        expect(result.statusCode).toBe(404);
    });

    test("Found todo list and return it", async () => {
        // given
        const todoList = getSampleTodoList();
        const requestEvent = {
            pathParameters: {listId: todoList.listId} as APIGatewayProxyEventPathParameters
        } as APIGatewayProxyEvent;
        fetchTodoListByIdMock.mockResolvedValue(todoList);
        // when
        const result = await getTodoList(requestEvent);
        // then
        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(fetchTodoListByIdMock).toBeCalledWith(todoList.listId);

        expect(result.statusCode).toBe(200);
        expect(result.body).toBeDefined();
        const resultTodoList = JSON.parse(result.body) as ToDoList;
        expect(resultTodoList).toEqual(todoList);
    });
});

describe("ManageTodoListHandler.updateTodoList", () => {
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
        const response = await updateTodoList(requestEvent);
        // then
        expect(response.statusCode).toBe(400);

        expect(fetchTodoListByIdMock).toBeCalledTimes(0);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Validate request - not present listName", async () => {
        // given
        const body = {deadlineDate: "2022-07-06T18:24:00"};
        const requestEvent = {
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;
        // when
        const response = await updateTodoList(requestEvent);
        // then
        expect(response.statusCode).toBe(400);

        expect(fetchTodoListByIdMock).toBeCalledTimes(0);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Validate request - not present deadlineDate", async () => {
        // given
        const body = {listName: "listName"};
        const requestEvent = {
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;
        // when
        const response = await updateTodoList(requestEvent);
        // then
        expect(response.statusCode).toBe(400);

        expect(fetchTodoListByIdMock).toBeCalledTimes(0);
        expect(saveTodoListMock).toBeCalledTimes(0);
    });

    test("Updated todo list", async () => {
        // given
        const todoList = getSampleTodoList();
        const newName = "newName";
        const newDeadlineDate = "2022-09-06T12:20:00"

        const updatedTodoList = JSON.parse(JSON.stringify(todoList)) as ToDoList;
        updatedTodoList.name = newName;
        updatedTodoList.deadlineDate = newDeadlineDate;

        const body = {
            listName: newName,
            deadlineDate: newDeadlineDate
        }
        const requestEvent = {
            pathParameters: {listId: todoList.listId} as APIGatewayProxyEventPathParameters,
            body: JSON.stringify(body)
        } as APIGatewayProxyEvent;

        fetchTodoListByIdMock.mockResolvedValue(todoList);

        // when
        const result = await updateTodoList(requestEvent);

        // then
        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(fetchTodoListByIdMock).toBeCalledWith(todoList.listId);

        expect(saveTodoListMock).toBeCalledTimes(1);

        expect(result.statusCode).toBe(200);
        expect(result.body).toBeDefined();
        const resultTodoList = JSON.parse(result.body) as ToDoList;
        expect(resultTodoList).toEqual(updatedTodoList);
    });
});

describe("ManageTodoListHandler.deleteTodoList", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Not found todo list to delete", async () => {
        // given
        const listId = "listId";
        const requestEvent = {
            pathParameters: {listId} as APIGatewayProxyEventPathParameters
        } as APIGatewayProxyEvent;
        fetchTodoListByIdMock.mockImplementation(() => {
            throw new NotFoundException("todoList", listId)
        });
        // when
        const result = await deleteTodoList(requestEvent);
        // then
        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(fetchTodoListByIdMock).toBeCalledWith(listId);

        expect(removeTodoListMock).toBeCalledTimes(0);

        expect(result.statusCode).toBe(404);
    });

    test("Delete todo list successfully", async () => {
        // given
        const todoList = getSampleTodoList();
        const requestEvent = {
            pathParameters: {listId: todoList.listId} as APIGatewayProxyEventPathParameters
        } as APIGatewayProxyEvent;
        fetchTodoListByIdMock.mockResolvedValue(todoList);
        // when
        const result = await deleteTodoList(requestEvent);
        // then
        expect(fetchTodoListByIdMock).toBeCalledTimes(1);
        expect(fetchTodoListByIdMock).toBeCalledWith(todoList.listId);

        expect(removeTodoListMock).toBeCalledTimes(1);
        expect(removeTodoListMock).toBeCalledWith(todoList.listId);

        expect(result.statusCode).toBe(204);
    });
});

function getSampleTodoList(): ToDoList {
    const todoItem1 = new ToDoItem("idItem1", "item1", false, '2022-07-06T18:24:00');
    const todoItem2 = new ToDoItem("idItem2", "item2", false, '2022-07-06T18:24:00');
    const todoItem3 = new ToDoItem("idItem3", "item3", true, '2022-06-06T18:24:00');
    return new ToDoList("idList1", 'list1', '2022-07-04T18:24:00', 'user1', '2022-07-06T18:24:00', [todoItem1, todoItem2, todoItem3]);
}