import { ResponseError } from "../error/response-error.js";
import { Schema } from "joi";

export const validate = (schema: Schema, data: any) => {
    const result = schema.validate(data);
    
    if (result.error) {
        throw new ResponseError(400, result.error.message);
    }

    return result.value;
};
