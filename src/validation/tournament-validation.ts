import Joi, { Schema } from "joi";

export const createTournamentValidation: Schema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    pointsToPlay: Joi.number().required(),
    creatorId: Joi.number().required(),
    location: Joi.string().required(),
    numberOfCourt: Joi.number().required(),
    players: Joi.array().items(Joi.object({
        name: Joi.string().required(),
    })).required().min(4)
});

export const deleteTournamentValidation: Schema = Joi.object({
    id: Joi.number().required(),
});

export const getTournamentsByCreatorIdValidation: Schema = Joi.object({
    creatorId: Joi.number().required(),
});