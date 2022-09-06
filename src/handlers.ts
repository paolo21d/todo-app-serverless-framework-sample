import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {NotFoundException} from "./exception/NotFoundException";
import * as yup from "yup";

export const defaultHeaders = {
    "content-type": "application/json",
};

export const hello = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log("EVENT:")
    console.log(event)

    console.log("CONTEXT");
    console.log(context);

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: "Go Serverless v1.0! Your function executed successfully!",
                input: event,
                context: context
            },
            null,
            2,
        ),
    };
};


/// private methods
export function handleError(error: Error): APIGatewayProxyResult {
    if (error instanceof NotFoundException) {
        return {
            statusCode: error.statusCode,
            headers: defaultHeaders,
            body: error.responseBody
        }
    }

    if (error instanceof yup.ValidationError) {
        return {
            statusCode: 400,
            headers: defaultHeaders,
            body: JSON.stringify({
                errors: error.errors,
            }),
        };
    }

    if (error instanceof SyntaxError) {
        return {
            statusCode: 400,
            headers: defaultHeaders,
            body: JSON.stringify({error: `invalid request body format : "${error.message}"`}),
        };
    }
    throw error;
}