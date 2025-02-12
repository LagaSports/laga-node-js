import Joi, { Schema } from "joi";

export const userRegistrationSchema: Schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    phoneNumber: Joi.string().required()
});