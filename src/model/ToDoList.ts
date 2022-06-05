import {ToDoItem} from "./ToDoItem";

export class ToDoList {
    listId: string;
    name: string;
    deadlineDate: string;
    userId: string;
    createDate: string;
    items: ToDoItem[] | null;

    constructor(listId: string, name: string, deadlineDate: string, userId: string, createDate: string, items: ToDoItem[] | null) {
        this.listId = listId;
        this.name = name;
        this.deadlineDate = deadlineDate;
        this.userId = userId;
        this.createDate = createDate;
        this.items = items;
    }

    // TODO when I try to use it there is problem: "TypeError: todoList.addItem is not a function"
    addItem(newItem: ToDoItem): void {
        if (this.items != null && this.items.length > 0) {
            this.items.push(newItem);
        } else {
            this.items = [newItem];
        }
    }
}