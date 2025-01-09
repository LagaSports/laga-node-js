import { prismaClient } from "../application/database.js";
import { RegisterUserRequest } from "../dto/RegisterUserRequest.js";
import { ResponseError } from "../error/response-error.js";
import { registerUserValidation } from "../validation/user-validation.js";
import { validate } from "../validation/validation.js";

export class UserService {

    async register(payload: RegisterUserRequest) {
        const validation = validate(registerUserValidation, payload);
        const email = payload.email;
        const phoneNumber = payload.phoneNumber;
    }
}