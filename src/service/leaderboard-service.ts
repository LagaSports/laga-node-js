import { Leaderboard, Team } from "@prisma/client";

import { LeaderboardRepository } from "../repository/leaderboard-repository.js";
import { PrismaClient, Prisma, Match, MatchScore } from "@prisma/client";
import { MatchRepository } from "../repository/match-repository.js";
import { LeaderboardDTO } from "../dto/internal/TournamentDTO.js";


export class LeaderboardService {

    constructor(private readonly leaderboardRepository: LeaderboardRepository, private readonly matchRepository: MatchRepository, private readonly prismaClient: PrismaClient) {}

    public updateLeaderboard = async (tournamentId: number, tx?: Prisma.TransactionClient): Promise<Leaderboard[]> => {
        const leaderboards = await this.leaderboardRepository.findByTournamentId(tournamentId, tx);
        const matches = await this.matchRepository.findByTournamentId(tournamentId, tx);

        return await this.leaderboardRepository.updateLeaderboard(tournamentId, tx);
    }

    public updateLeaderboardWithTransaction = async (tournamentId: number): Promise<Leaderboard[]> => {
        return await this.prismaClient.$transaction(async (tx) => {
            return await this.updateLeaderboard(tournamentId, tx);
        });
    }

    // private calculateLeaderboard = async (matches: Match[]): Promise<LeaderBoardDTO[]> => {
    //     const leaderboard: LeaderBoardDTO[] = [];
    //     const players
    //     const matchScores: MatchScore[] = matches.map(match => match.match_scores).flat();
    //     const teamsMap = new Map<number, Team>();
    //     teams.forEach(team => {
    //         teamsMap.set(team.id, team);
    //     });
    //     matchScores.forEach(matchScore => {
    //         const leaderboardItem: LeaderBoardDTO = {
    //             playerId: matchScore.playerId,
    //             playerName: matchScore.playerName,
    //             teamId: matchScore.teamId,
    //             teamName: matchScore.teamName,
    //             points: matchScore.points,
    //         }
    //         leaderboard.push(leaderboardItem);
    //     });
    //     return leaderboard;
    // }

    public findLeaderboardByTournamentId = async (tournamentId: number): Promise<LeaderboardDTO[]> => {
        const leaderboards = await this.leaderboardRepository.findByTournamentId(tournamentId);
        return leaderboards.map(this.convertLeaderboardToDTO);
    }

    private convertLeaderboardToDTO = (leaderboard: Leaderboard): LeaderboardDTO => {   
        return {
            id: leaderboard.id,
            tournamentId: leaderboard.tournament_id,
            playerName: leaderboard.player.name,
            playerWin: leaderboard.matches_won,
            playerLoss: leaderboard.matches_lost,
            playerDraw: leaderboard.matches_draw,
            playerPoints: leaderboard.points,
            playerDifference: (leaderboard.matches_won + leaderboard.matches_draw + leaderboard.matches_lost) - leaderboard.points,
        }
    }
}
