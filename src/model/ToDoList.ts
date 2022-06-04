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
}