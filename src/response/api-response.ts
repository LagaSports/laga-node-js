export interface ApiResponse<T> {
    status: number;
    message: string;
    data?: T;
}

export class ApiResponseBuilder {
    static success<T>(data?: T, message: string = "Success"): ApiResponse<T> {
        return {
            status: 200,
            message,
            data
        };
    }

    static created<T>(data?: T, message: string = "Created successfully"): ApiResponse<T> {
        return {
            status: 201,
            message,
            data
        };
    }

    static noContent(message: string = "No content"): ApiResponse<null> {
        return {
            status: 204,
            message
        };
    }
} 