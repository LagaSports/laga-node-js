import Joi, { Schema } from "joi";
    
export const updateMatchScoreBulkValidation : Schema = Joi.object({
    updates: Joi.array().items(Joi.object({
        matchScoreId: Joi.number().required(),
        score: Joi.number().required(),
    })).required()
});

export const generateNextRoundMatchValidation : Schema = Joi.object({
    tournamentId: Joi.number().required(),
});