import { Match, PrismaClient, Tournament, TournamentAddress } from "@prisma/client";
import { CreateTournamentRequestDTO } from "../dto/api/CreateTournamentRequest.js";
import { GetTournamentByCreatorRequestDTO } from "../dto/api/GetTournamentByCreatorRequestDTO.js";
import { CreateTournamentDTO } from "../dto/internal/CreateTournamentDTO.js";
import { PlayerDTO } from "../dto/internal/PlayerDTO.js";
import { RecentTournamentDTO, TournamentDTO } from "../dto/internal/TournamentDTO.js";
import { ResponseError } from "../error/response-error.js";
import { TournamentRepository } from "../repository/tournament-repository.js";
import { UserRepository } from "../repository/user-repository.js";
import { createTournamentValidation, getTournamentsByCreatorIdValidation } from "../validation/tournament-validation.js";
import { validate } from "../validation/validation.js";
import { MatchService } from "./match-service.js";
import { PlayerService } from "./player-service.js";

export class TournamentService {
    constructor(
        private readonly tournamentRepository: TournamentRepository,
        private readonly userRepository: UserRepository,
        private readonly playerService: PlayerService,
        private readonly matchService: MatchService,
        private readonly prismaClient: PrismaClient,
    ) {}

    public create = async (payload: CreateTournamentRequestDTO): Promise<TournamentDTO> => {
        try {
            validate(createTournamentValidation, payload);

            return await this.prismaClient.$transaction(async (tx) => {
                const tournamentAddressPayload: any = {
                    name: payload.location.name,
                    google_maps_link: payload.location.googleMapsLink,
                    description: payload.location.description,
                    google_place_id: payload.location.placeId,
                };
                const tournamentAddress = await this.tournamentRepository.createTournamentAddress(tournamentAddressPayload, tx);
                const tournamentData: CreateTournamentDTO = {
                    name: payload.name,
                    type: payload.type,
                    points_to_play: Number(payload.pointsToPlay),
                    creator_id: payload.creatorId,
                    number_of_court: Number(payload.numberOfCourt),
                    tournament_address_id: tournamentAddress.id,
                };

                const createdTournament = await this.tournamentRepository.create(tournamentData, tx);
                
                const tournament = await this.tournamentRepository.findById(createdTournament.id, tx);

                if (!tournament) {
                    throw new ResponseError(404, "Tournament not found");
                }

                const playerDTOs: Array<PlayerDTO> = payload.players.map((player) => ({
                    name: player.name,
                    email: player.email,
                    phoneNumber: player.phoneNumber,
                    tournamentId: tournament.id,
                }));

                await this.playerService.createMany(playerDTOs, tx);
                await this.matchService.generateMatches({tournamentId: tournament.id}, tx);
                
                return this.mapToTournamentDTO(tournament);
            });
        } catch (error) {
            console.error(error);
            if (error instanceof ResponseError) {
                throw new ResponseError(400, "Failed to create tournament");
            }
            throw new ResponseError(500, "Internal server error");
        }
    }

    public getTournamentsByCreatorId = async (dto: GetTournamentByCreatorRequestDTO): Promise<TournamentDTO[]> => {
        try {
            await this.validateGetTournamentsByCreatorId(dto);
            const tournaments = await this.tournamentRepository.findByCreatorId(dto.creatorId);
            return tournaments.map(this.mapToTournamentDTO);
        } catch (error) {
            console.error(error);
            if (error instanceof ResponseError) {
                throw error;
            }
            throw new ResponseError(500, "Internal server error");
        }
    }

    public findById = async (id: number): Promise<TournamentDTO> => {
        try {
            if (!id) {
                throw new ResponseError(400, "Id is required");
            }
            const tournament = await this.tournamentRepository.findById(id);
            console.log(tournament);
            
            if (!tournament) {
               throw new ResponseError(404, "Tournament not found");
            }

            return this.mapToTournamentDTO(tournament);
        } catch (error) {
            console.error(error);
            if (error instanceof ResponseError) {
                throw error;
            }
            throw new ResponseError(500, "Internal server error");
        }
    }

    private validateGetTournamentsByCreatorId = async (dto: GetTournamentByCreatorRequestDTO): Promise<void> => {
        validate(getTournamentsByCreatorIdValidation, dto);
        const user = await this.userRepository.findById(dto.creatorId);
        if (!user) {
            throw new ResponseError(404, "User not found");
        }
    }

    private mapToTournamentDTO = (tournament: any): TournamentDTO => {
        return {
            id: tournament.id,
            name: tournament.name,
            creatorId: tournament.creator_id,
            pointsToPlay: tournament.points_to_play,
            type: tournament.type,
            numberOfCourt: tournament.number_of_court,
            matches: tournament?.matches?.map((match: any) => ({
                id: match.id,
                round: match.round_number,
                matchScores: match.match_scores,
                courtNumber: match.court_number,
                status: match.status,
            })) ?? [],
            players: tournament.players?.map((player: any) => ({
                id: player.id,
                name: player.name,
                email: player.email,
                phoneNumber: player.phone_number,
            })) ?? [],
            location: tournament.tournament_address ? {
                name: tournament.tournament_address.name,
                googleMapsLink: tournament.tournament_address.google_maps_link,
                description: tournament.tournament_address.description,
                googlePlaceId: tournament.tournament_address.google_place_id,
            } : null,
        };
    }

    public getRecentTournaments = async (): Promise<RecentTournamentDTO[]> => {
        try {   
            const tournaments = await this.tournamentRepository.findRecentTournaments();
            const recentTournaments: RecentTournamentDTO[] = tournaments.map((tournament) => ({
                id: tournament.id,
                name: tournament.name,
                location: tournament.location,
                numberOfCourt: tournament.number_of_court,
                numberOfPlayers: tournament.players.length,
            }));
            return recentTournaments;
        } catch (error) {
            console.error(error);
            if (error instanceof ResponseError) {
                throw error;
            }
            throw new ResponseError(500, "Internal server error");
        }
    }
}