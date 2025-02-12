import { Leaderboard, PrismaClient, Prisma } from "@prisma/client";

export class LeaderboardRepository {
    constructor(private prismaClient: PrismaClient) {}

    findByTournamentId = async (tournamentId: number, tx?: Prisma.TransactionClient): Promise<Leaderboard[]> => {
        return await (tx ?? this.prismaClient).leaderboard.findMany({
            where: {
                tournament_id: tournamentId
            },
            orderBy: {
                points: 'desc'
            },
            include: {
                player: true,
                team: true
            }   
        });
    }

    save = async (leaderboard: Leaderboard, tx?: Prisma.TransactionClient): Promise<Leaderboard> => {   
        if (!leaderboard.id) {
            // Create new record if id is undefined
            return await (tx ?? this.prismaClient).leaderboard.create({
                data: leaderboard
            });
        }

        // Update existing record if id exists
        return await (tx ?? this.prismaClient).leaderboard.update({
            where: {
                id: leaderboard.id
            },
            data: {
                points: leaderboard.points,
                matches_won: leaderboard.matches_won,
                matches_lost: leaderboard.matches_lost,
                matches_draw: leaderboard.matches_draw,
                matches_played: leaderboard.matches_played
            }
        });
    }
}
