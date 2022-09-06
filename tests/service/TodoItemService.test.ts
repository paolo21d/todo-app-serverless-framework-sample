import {NotFoundException} from "../../src/exception/NotFoundException";
import {ToDoList} from "../../src/model/ToDoList";
import {ToDoItem} from "../../src/model/ToDoItem";
import {fetchTodoItemById, findItemInTodoList} from "../../src/service/TodoItemService";
import {fetchTodoListById} from "../../src/service/TodoListService";

jest.mock("../../src/service/TodoListService");
const fetchTodoListByIdMock = fetchTodoListById as jest.Mock;

describe("TodoItemService.findItemInTodoList", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Null items list", async () => {
        // given
        const todoList = getSampleTodoList();
        todoList.items = null;
        // when then
        expect(() => findItemInTodoList(todoList, "itemId")).toThrow(NotFoundException);
    });

    test("Empty array items list", async () => {
        // given
        const todoList = getSampleTodoList();
        todoList.items = [];
        // when then
        expect(() => findItemInTodoList(todoList, "itemId")).toThrow(NotFoundException);
    });

    test("Items list without searching item", async () => {
        // given
        const todoList = getSampleTodoList();
        // when then
        expect(() => findItemInTodoList(todoList, "notPresentId")).toThrow(NotFoundException);
    });

    test("Items list with searching item", async () => {
        // given
        const todoItem1 = new ToDoItem("idItem1", "item1", false, '2022-07-06T18:24:00');
        const todoItem2 = new ToDoItem("idItem2", "item2", false, '2022-07-06T18:24:00');
        const todoItem3 = new ToDoItem("idItem3", "item3", true, '2022-06-06T18:24:00');
        const todoList = new ToDoList("idList1", 'list1', '2022-07-04T18:24:00', 'user1', '2022-07-06T18:24:00', [todoItem1, todoItem2, todoItem3]);
        // when
        const result = findItemInTodoList(todoList, todoItem1.itemId);
        // then
        expect(result).toBe(todoItem1);
    });
});

describe("TodoItemService.fetchTodoItemById", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Null items list", async () => {
        // given
        const todoList = getSampleTodoList();
        todoList.items = null;
        fetchTodoListByIdMock.mockReturnValue(todoList);
        // when then
        await expect(() => fetchTodoItemById(todoList.listId, "itemId"))
            .rejects.toThrow(NotFoundException);
    });

    test("Empty array items list", async () => {
        // given
        const todoList = getSampleTodoList();
        todoList.items = [];
        fetchTodoListByIdMock.mockReturnValue(todoList);
        // when then
        await expect(() => fetchTodoItemById(todoList.listId, "itemId"))
            .rejects.toThrow(NotFoundException);
    });

    test("Items list without searching item", async () => {
        // given
        const todoList = getSampleTodoList();
        fetchTodoListByIdMock.mockReturnValue(todoList);
        // when then
        await expect(() => fetchTodoItemById(todoList.listId, "notPresentItemId"))
            .rejects.toThrow(NotFoundException);
    });

    test("Items list with searching item", async () => {
        // given
        const todoItem1 = new ToDoItem("idItem1", "item1", false, '2022-07-06T18:24:00');
        const todoItem2 = new ToDoItem("idItem2", "item2", false, '2022-07-06T18:24:00');
        const todoItem3 = new ToDoItem("idItem3", "item3", true, '2022-06-06T18:24:00');
        const todoList = new ToDoList("idList1", 'list1', '2022-07-04T18:24:00', 'user1', '2022-07-06T18:24:00', [todoItem1, todoItem2, todoItem3]);
        fetchTodoListByIdMock.mockReturnValue(todoList);
        // when
        const result = await fetchTodoItemById(todoList.listId, todoItem1.itemId);
        // then
        expect(result).toBe(todoItem1);
    });
});


function getSampleTodoList(): ToDoList {
    const todoItem1 = new ToDoItem("idItem1", "item1", false, '2022-07-06T18:24:00');
    const todoItem2 = new ToDoItem("idItem2", "item2", false, '2022-07-06T18:24:00');
    const todoItem3 = new ToDoItem("idItem3", "item3", true, '2022-06-06T18:24:00');
    return new ToDoList("idList1", 'list1', '2022-07-04T18:24:00', 'user1', '2022-07-06T18:24:00', [todoItem1, todoItem2, todoItem3]);
}