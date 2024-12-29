import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response-error.js";

export const errorMiddleware = (
    err: Error | ResponseError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ResponseError) {
        res.status(err.status).json({
            errors: err.message
        }).end();
    } else {            
        res.status(500).json({
            errors: err.message
        }).end();
    }
}; 
