import { Player, Prisma } from "@prisma/client";
import { CreatePlayerDTO } from "../dto/internal/CreatePlayerDTO.js";
import { PlayerDTO } from "../dto/internal/PlayerDTO.js";
import { ResponseError } from "../error/response-error.js";
import { PlayerRepository } from "../repository/player-repository.js";

interface PlayerServiceDependencies {
    playerRepository: PlayerRepository;
}

export class PlayerService {
    constructor(private readonly playerRepository: PlayerRepository) {}

    public create = async (payload: PlayerDTO): Promise<Player> => {
        try {
            const createPlayerDTO: CreatePlayerDTO = {
                name: payload.name,
                email: payload.email,
                phone_number: payload.phoneNumber,
                tournament_id: payload.tournamentId,
            };
            return await this.playerRepository.create(createPlayerDTO);
        } catch (error) {
            if (error instanceof ResponseError) {
                throw error;
            }
            throw new ResponseError(500, "Internal server error");
        }
    }

    public createMany = async (payload: Array<PlayerDTO>, tx?: Prisma.TransactionClient): Promise<Array<Player>> => {
        try {
            const createPlayerDTOs: Array<CreatePlayerDTO> = payload.map((player) => ({
                name: player.name,
                email: player.email,
                phone_number: player.phoneNumber,
                tournament_id: player.tournamentId,
            }));
            return await this.playerRepository.createMany(createPlayerDTOs, tx);
        } catch (error) {
            if (error instanceof ResponseError) {
                throw error;
            }
            throw new ResponseError(500, "Internal server error");
        }
    }

    public findById = async (id: number): Promise<Player> => {
        try {
            if (!id) {
                throw new ResponseError(400, "Id is required");
            }
            const player = await this.playerRepository.findById(id);
            if (!player) {
                throw new ResponseError(404, "Player not found");
            }
            return player;
        } catch (error) {
            if (error instanceof ResponseError) {
                throw error;
            }
            throw new ResponseError(500, "Internal server error");
        }
    }
}