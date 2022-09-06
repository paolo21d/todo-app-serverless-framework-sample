import {docClient} from "../../src/service/DynamoDocumentClient";
import {fetchAllTodoLists, fetchTodoListById} from "../../src/service/TodoListService";
import {NotFoundException} from "../../src/exception/NotFoundException";
import {ToDoList} from "../../src/model/ToDoList";
import {ToDoItem} from "../../src/model/ToDoItem";
import {v4} from "uuid";


jest.mock("../../src/service/DynamoDocumentClient");
const mockGet = docClient.get as jest.Mock;
const mockScan = docClient.scan as jest.Mock;

describe("TodoListService.fetchTodoListById", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Not found todo list thrown exception", async () => {
        const mockedResponse = jest.fn().mockReturnValue(Promise.resolve({}));
        mockGet.mockImplementation(() => ({promise: mockedResponse}));

        // try {
        //     await fetchTodoListById("");
        // } catch (error) {
        //     expect(error).toBeDefined();
        // }

        await expect(() => fetchTodoListById(""))
            .rejects.toThrow(NotFoundException);
    });

    test("Found todo list returned", async () => {
        // given
        const todoList = getSampleTodoList();
        const mockedResponse = jest.fn().mockReturnValue(Promise.resolve({Item: todoList}));
        mockGet.mockImplementation(() => ({promise: mockedResponse}));
        // when
        const result = await fetchTodoListById("");
        // then
        expect(result).toBe(todoList);
        expect(mockGet).toHaveBeenCalledTimes(1);
    });
});

describe("TodoListService.fetchAllTodoLists", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("fetched multiple todo lists", async () => {
        // given
        const todoLists = [getSampleTodoList(), getSampleTodoList()];
        const mockedResponse = jest.fn().mockReturnValue(Promise.resolve({Items: todoLists}));
        mockScan.mockImplementation(() => ({promise: mockedResponse}));
        // when
        const result = await fetchAllTodoLists();
        // then
        expect(result).toBe(todoLists);
        expect(mockScan).toHaveBeenCalledTimes(1);
    });

    test("fetched one todo list", async () => {
        // given
        const todoLists = [getSampleTodoList()];
        const mockedResponse = jest.fn().mockReturnValue(Promise.resolve({Items: todoLists}));
        mockScan.mockImplementation(() => ({promise: mockedResponse}));
        // when
        const result = await fetchAllTodoLists();
        // then
        expect(result).toBe(todoLists);
        expect(mockScan).toHaveBeenCalledTimes(1);
    });

    test("fetched none todo lists", async () => {
        // given
        const todoLists = [] as ToDoList[];
        const mockedResponse = jest.fn().mockReturnValue(Promise.resolve({Items: todoLists}));
        mockScan.mockImplementation(() => ({promise: mockedResponse}));
        // when
        const result = await fetchAllTodoLists();
        // then
        expect(result).toBe(todoLists);
        expect(mockScan).toHaveBeenCalledTimes(1);
    });
});


function getSampleTodoList(): ToDoList {
    const todoItem1 = new ToDoItem(v4(), "item1", false, '2022-07-06T18:24:00');
    const todoItem2 = new ToDoItem(v4(), "item2", false, '2022-07-06T18:24:00');
    const todoItem3 = new ToDoItem(v4(), "item3", true, '2022-06-06T18:24:00');
    return new ToDoList(v4(), 'list1', '2022-07-04T18:24:00', 'user1', '2022-07-06T18:24:00', [todoItem1, todoItem2, todoItem3]);
}