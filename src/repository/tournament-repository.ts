import { PrismaClient, Tournament, Prisma } from "@prisma/client";
import { CreateTournamentDTO } from "../dto/internal/CreateTournamentDTO.js";
import { RecentTournamentDTO } from "../dto/internal/TournamentDTO.js";

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


    findByCreatorId = async (creatorId: number): Promise<any[]> => {
        const tournaments : any = await this.prismaClient.tournament.findMany({
            select: {
                id: true,
                name: true,
                creator_id: true,
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

    findById = async (id: number, tx?: Prisma.TransactionClient): Promise<any | null> => {
        return await (tx ?? this.prismaClient).tournament.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                type: true,
                points_to_play: true,
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
                },
                padel_court: {
                    select: {
                        id: true,
                        court_name: true,
                    }
                }
            }
        });
    }

    findRecentTournaments = async (): Promise<any[]> => {
        return await this.prismaClient.tournament.findMany({
            orderBy: {
                created_at: 'desc',
            },
            take: 4,
            select: {
                id: true,
                name: true,
                number_of_court: true,
                players: {
                    select: {
                        id: true,
                    }
                }
            }
        });
    }
}