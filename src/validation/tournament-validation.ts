import Joi, { Schema } from "joi";

export const createTournamentValidation: Schema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    pointsToPlay: Joi.number().required(),
    creatorId: Joi.number().required(),
});

export const deleteTournamentValidation: Schema = Joi.object({
    id: Joi.number().required(),
});