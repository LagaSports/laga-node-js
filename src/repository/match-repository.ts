import { Match, MatchScore, Player, PlayerTeam, Prisma, PrismaClient, Team } from "@prisma/client";
import { CreateMatchDTO } from "../dto/internal/CreateMatchDTO.js";
import { CreateMatchScoreDTO } from "../dto/internal/CreateMatchScoreDTO.js";
import { UpdateMatchScoreDTO } from "../dto/api/UpdateMatchScoreRequestDTO.js";
import { MATCH_STATUS_IN_PROGRESS } from "../constant/match.js";

export class MatchRepository {
    constructor(private prismaClient: PrismaClient) {}

    create = async (data: CreateMatchDTO, tx?: Prisma.TransactionClient): Promise<Match> => {
        return await (tx ?? this.prismaClient).match.create({
            data: {
                tournament_id: data.tournamentId,
                round_number: data.roundNumber,
                court_number: data.courtNumber,
                status: MATCH_STATUS_IN_PROGRESS,
                start_time: new Date(),
            }
        });
    }

    save = async (data: Match, tx?: Prisma.TransactionClient): Promise<Match> => {
        return await (tx ?? this.prismaClient).match.update({
            where: { id: data.id },
            data: data
        });
    }

    saveMany = async (data: Match[], tx?: Prisma.TransactionClient): Promise<Match[]> => {
        await (tx ?? this.prismaClient).match.updateMany({
            data: data
        });

        return await (tx ?? this.prismaClient).match.findMany({
            where:{
                id: {
                    in: data.map(item => item.id)
                }
            }
        })

    }

    findByTournamentId = async (tournamentId: number, tx?: Prisma.TransactionClient): Promise<Match[]> => {
        return await (tx ?? this.prismaClient).match.findMany({
            where: {
                tournament_id: tournamentId
            },
            include: {
                match_scores: {
                    include: {
                        team: {
                            include: {
                                player_teams: true
                            }
                        }
                    }
                },
                matchSets: true,
            }
        });
    }

    findById = async (id: number, tx?: Prisma.TransactionClient): Promise<Match | null> => {
        return await (tx ?? this.prismaClient).match.findUnique({
            where: { id },
            include: {
                tournament: {
                    select: {
                        type: true
                    }
                },
                match_scores: true,
                matchSets: true
            }
        });
    }

    updateStatus = async (id: number, status: string, tx?: Prisma.TransactionClient): Promise<Match> => {
        return await (tx ?? this.prismaClient).match.update({
            where: { id },
            data: { status }
        });
    }

    createTeam = (tournamentId: number, teamName: string, player1: number, player2: number, tx?: Prisma.TransactionClient): Promise<Team> => {
        return (tx ?? this.prismaClient).team.create({
            data: {
                name: teamName,
                tournament_id: tournamentId,
                player_teams: {
                    create: [
                        { player_id: player1 },
                        { player_id: player2 }
                    ]
                }
            },
            include: {
                player_teams: true
            }
        });
    }

    createMatchScore = (data: CreateMatchScoreDTO, tx?: Prisma.TransactionClient): Promise<MatchScore> => {
        return (tx ?? this.prismaClient).matchScore.create({
            data: {
                match_id: data.matchId,
                team_id: data.teamId,
                score: data.score
            }
        });
    }   

    createManyMatchScore = async (data: Array<CreateMatchScoreDTO>, tx?: Prisma.TransactionClient): Promise<MatchScore[]> => {
        return await (tx ?? this.prismaClient).matchScore.createManyAndReturn({
            data: data.map((item) => ({
                match_id: item.matchId,
                team_id: item.teamId,
                score: item.score
            }))
        });
    }

    findLatestRoundNumberByTournamentId = async (tournamentId: number, tx?: Prisma.TransactionClient): Promise<number> => {
        const match = await (tx ?? this.prismaClient).match.findFirst({
            where: { tournament_id: tournamentId },
            orderBy: { round_number: 'desc' }
        });
        return match?.round_number ?? 0;
    }

    findPlayerIdByTeamId = async (teamId: number, tx?: Prisma.TransactionClient): Promise<number[]> => {
        const playerTeams: PlayerTeam[] =  await (tx ?? this.prismaClient).playerTeam.findMany({
            where: { team_id: teamId },
            select: {
                player: {
                    select: {
                        id: true,
                    }
                },
                team: false
            }
        });
        return playerTeams.map(playerTeam => playerTeam.player.id);
    }

    findPlayersByTeamId = async (teamId: number, tx?: Prisma.TransactionClient): Promise<number[]> => {
        return await (tx ?? this.prismaClient).playerTeam.findMany({
            where: { team_id: teamId },
            select: { player_id: true }
        }).then(results => results.map(r => r.player_id));
    }

    updateManyMatchScore = async (data: UpdateMatchScoreDTO[], tx?: Prisma.TransactionClient): Promise<MatchScore[]> => {
        // Use transaction for atomic updates
        const updatePromises = [];
        for (const item of data) {  
            updatePromises.push(
                (tx ?? this.prismaClient).matchScore.update({
                    where: { id: item.matchScoreId },
                    data: { score: item.score }
                })
            );
        }
        await Promise.all(updatePromises);
        return await (tx ?? this.prismaClient).matchScore.findMany({
            where: { id: { in: data.map(item => item.matchScoreId) } }
        });
    }   


    findMatchScoreById = async (id: number, tx?: Prisma.TransactionClient): Promise<MatchScore | null> => {
        return await (tx ?? this.prismaClient).matchScore.findUnique({
            where: { id }
        });
    }   

    findMatchScoreByMatchId = async (matchId: number, tx?: Prisma.TransactionClient): Promise<MatchScore[]> => {
        return await (tx ?? this.prismaClient).matchScore.findMany({
            where: { match_id: matchId },
            select: {
                id: true,
                match_id: true,
                score: true,
                team: {
                    select: {
                        player_teams: {
                            select: {
                                player: true
                            }
                        }
                    }
                }
            }
        });
    }
} 