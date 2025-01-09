import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response-error.js";
import { ApiResponse } from "../response/api-response.js";
import { logger } from "../application/logging.js";

export const errorMiddleware = (
    err: Error | ResponseError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log(err);
    const response: ApiResponse<null> = {
        status: err instanceof ResponseError ? err.status : 500,
        message: err.message
    };

    res.status(response.status)
        .json(response)
        .end();
}; 
