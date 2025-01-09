import { CreateTournamentRequest } from "../dto/api/CreateTournamentRequest.js";
import { CreateTournamentDTO } from "../dto/internal/CreateTournamentDTO.js";
import { TournamentRepository } from "../repository/tournament-repository.js";
import { createTournamentValidation } from "../validation/tournament-validation.js";
import { validate } from "../validation/validation.js";

export class TournamentService {

    constructor(
        private readonly  tournamentRepository: TournamentRepository,
    ) {}

    create = async (payload: CreateTournamentRequest) => {
        validate(createTournamentValidation, payload);

        const tournamentData: CreateTournamentDTO = {
            name: payload.name,
            type: payload.type,
            points_to_play: Number(payload.pointsToPlay),
            creator_id: Number(payload.creatorId)
        };

        const tournament = await this.tournamentRepository.create(tournamentData);
        return tournament;
    }

}