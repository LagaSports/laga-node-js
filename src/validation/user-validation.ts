import Joi, { Schema } from "joi";

export const registerUserValidation: Schema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email({ tlds: { allow: false } }).messages({
        'string.email': 'Invalid email format',
    }),
    phoneNumber: Joi.string().pattern(/^(\+62|62|0)8[1-9][0-9]{6,9}$/).message('Invalid Indonesian phone number format'),
    password: Joi.string().min(8).required(),
}).or('email', 'phoneNumber')
  .messages({
    'object.missing': 'Either email or phone number must be provided'
  });

export const loginUserValidation: Schema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).messages({
        'string.email': 'Invalid email format',
    }),
    phoneNumber: Joi.string().pattern(/^(\+62|62|0)8[1-9][0-9]{6,9}$/).message('Invalid Indonesian phone number format'),
    password: Joi.string().required(),
});