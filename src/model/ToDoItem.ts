export class ToDoItem {
    itemId: string;
    name: string;
    isDone: boolean;
    createDate: string;

    constructor(itemId: string, name: string, isDone: boolean, createDate: string) {
        this.itemId = itemId;
        this.name = name;
        this.isDone = isDone;
        this.createDate = createDate;
    }
}