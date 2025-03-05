import Joi, { Schema } from "joi";

export const createTournamentValidation: Schema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    pointsToPlay: Joi.number().required(),
    creatorId: Joi.number().required(),
    numberOfCourt: Joi.number().required(),
    location: Joi.object({
        placeId: Joi.string(),
        name: Joi.string().required(),
        googleMapsLink: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
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