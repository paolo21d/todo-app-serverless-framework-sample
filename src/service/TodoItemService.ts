import {ToDoItem} from "../model/ToDoItem";
import {ToDoList} from "../model/ToDoList";
import {NotFoundException} from "../exception/NotFoundException";
import {fetchTodoListById} from "./TodoListService";

export async function fetchTodoItemById(listId: string, itemId: string): Promise<ToDoItem> {
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

export function findItemInTodoList(todoList: ToDoList, itemId: string): ToDoItem {
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