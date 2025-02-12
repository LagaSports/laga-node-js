import { PrismaClient, Tournament, Prisma } from "@prisma/client";
import { CreateTournamentDTO } from "../dto/internal/CreateTournamentDTO.js";

export class TournamentRepository {

    constructor(
        private prismaClient: PrismaClient,
    ) {}

    create = async (payload: CreateTournamentDTO, tx?: Prisma.TransactionClient): Promise<Tournament> => {
        const tournament = await (tx ?? this.prismaClient).tournament.create({
            data: payload,
        });
        return tournament;
    }

    createMany = async (payload: Array<CreateTournamentDTO>): Promise<Array<Tournament>> => {
        const tournaments = await this.prismaClient.tournament.createManyAndReturn({
            data: payload,
        });
        return tournaments;
    }


    findByCreatorId = async (creatorId: number): Promise<Tournament[]> => {
        const tournaments = await this.prismaClient.tournament.findMany({
            select: {
                id: true,
                name: true,
                creator_id: true,
                location: true,
                points_to_play: true,
                type: true,
                players: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone_number: true,
                    }
                }
            },
            where: {
                creator_id: creatorId,
            },
            orderBy: {
                created_at: 'desc',
            },
        });
        
        return tournaments;
    }

    findById = async (id: number, tx?: Prisma.TransactionClient): Promise<Tournament | null> => {
        return await (tx ?? this.prismaClient).tournament.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                type: true,
                points_to_play: true,
                location: true,
                creator_id: true,
                number_of_court: true,
                matches: {
                    select: {
                        id: true,
                        round_number: true,
                        court_number: true,
                        status: true,
                        match_scores: {
                            select: {
                                id: true,
                                score: true,
                                team: {
                                    select: {
                                        id: true,
                                        player_teams: {
                                            select: {
                                                player: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                players: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone_number: true
                    }
                }
            }
        });
    }
}