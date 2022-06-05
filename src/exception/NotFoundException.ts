export class NotFoundException extends Error {
    public statusCode = 404;
    public responseBody: string;

    constructor(objectName: string, searchId: string) {
        super(JSON.stringify({error: `not found ${objectName} with id ${searchId}`}));
        this.responseBody = JSON.stringify({error: `not found ${objectName} with id ${searchId}`});
    }
}