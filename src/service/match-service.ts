import { Leaderboard, Match, Player, PrismaClient, Tournament, Prisma, MatchScore } from "@prisma/client";
import { MatchRepository } from "../repository/match-repository.js";
import { ResponseError } from "../error/response-error.js";
import { CreateMatchRequestDTO } from "../dto/api/CreateMatchRequestDTO.js";
import { TEAM_GENERATED_BY_SYSTEM } from "../constant/team.js";
import { TournamentRepository } from "../repository/tournament-repository.js";
import { LeaderboardRepository } from "../repository/leaderboard-repository.js";
import { CreateMatchDTO } from "../dto/internal/CreateMatchDTO.js";
import { CreateMatchScoreDTO } from "../dto/internal/CreateMatchScoreDTO.js";
import { PlayerPointsDTO } from "../dto/internal/PlayerPointsDTO.js";
import { EndMatchRequestDTO } from "../dto/api/EndMatchRequestDTO.js";
import { UpdateMatchScoreBulkRequestDTO } from "../dto/api/UpdateMatchScoreRequestDTO.js";
import { validate } from "../validation/validation.js";
import { generateNextRoundMatchValidation, updateMatchScoreBulkValidation } from "../validation/match-validation.js";
import { GenerateNextRoundMatchRequestDTO } from "../dto/api/GenerateNextRoundMatchRequestDTO.js";
import { GAME_TYPES } from "../dto/internal/TournamentDTO.js";

// Add interface for match status
export enum MatchStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

export class MatchService {
    constructor(
        private readonly matchRepository: MatchRepository,
        private readonly tournamentRepository: TournamentRepository,
        private readonly leaderboardRepository: LeaderboardRepository,
        private readonly prismaClient: PrismaClient
    ) {}

    public createMatch = async (payload: CreateMatchRequestDTO): Promise<Match> => {
        throw new Error("Method not implemented.");
    }

    public generateMatches = async (payload: GenerateNextRoundMatchRequestDTO, tx?: Prisma.TransactionClient): Promise<Match[]> => {
        validate(generateNextRoundMatchValidation, payload);
        const tournamentId = payload.tournamentId;
        const tournament: Tournament | null = await this.tournamentRepository.findById(tournamentId, tx);

        if (!tournament) {
            throw new ResponseError(404, `Tournament with ID ${tournamentId} not found`);
        }

        const latestRoundNumber = await this.matchRepository.findLatestRoundNumberByTournamentId(tournamentId, tx);
        const matches: Match[] = await this.matchRepository.findByTournamentId(tournamentId, tx);
        for (const match of matches) {
            if (match.status !== MatchStatus.COMPLETED) {
                throw new ResponseError(400, `All Match Score Must be submitted before going to next round`);
            }
        }
        
        // Get available courts from tournament
        const maxCourts = tournament?.number_of_court || 1;

        if (tournament.type === GAME_TYPES.MEXICANO || tournament.type === GAME_TYPES.MIXICANO || tournament.type === GAME_TYPES.TEAM_MIXICANO) {
            return this.generateMatchesByLeaderboard(tournament, latestRoundNumber, maxCourts, tx);
        } else {
            return this.generateMatchesByUnplayedOpponents(tournament, latestRoundNumber, maxCourts, tx);
        }
    }

    private generateMatchesByLeaderboard = async (
        tournament: any, 
        latestRoundNumber: number,
        maxCourts: number,
        tx?: Prisma.TransactionClient
    ): Promise<Match[]> => {
        // Get leaderboard data sorted by points
        const leaderboards = await this.leaderboardRepository.findByTournamentId(tournament.id, tx);
        const playerPoints: PlayerPointsDTO[] = tournament?.players.map((player: Player) => {
            const leaderboardEntry = leaderboards.find(l => l.player_id === player.id);
            return {
                playerId: player.id,
                points: leaderboardEntry?.points ?? 0
            };
        });

        // Sort players by points in descending order
        playerPoints.sort((a, b) => b.points - a.points);
        
        const matches: Match[] = [];
        const playerMap = new Map(tournament?.players.map((p: Player) => [p.id, p]));
        const playersInMatches = new Set<number>();
        const currentRound = latestRoundNumber + 1;
        let currentCourt = 1;

        // In Mexicano format:
        // 1st ranked plays with last ranked
        // 2nd ranked plays with second-to-last ranked
        // And they play against middle rankings
        while (playerPoints.length >= 4) {
            // Get top and bottom players for first team
            const topPlayer : any = playerMap.get(playerPoints[0].playerId);
            const bottomPlayer : any = playerMap.get(playerPoints[playerPoints.length - 1].playerId);
            
            // Get middle players for second team
            const middleIndex = Math.floor(playerPoints.length / 2);
            const middlePlayer1 : any = playerMap.get(playerPoints[middleIndex - 1].playerId);
            const middlePlayer2 : any = playerMap.get(playerPoints[middleIndex].playerId);

            console.log(topPlayer, "MMM");
            console.log(bottomPlayer, "MMM");
            console.log(middlePlayer1, "MMM");
            console.log(middlePlayer2, "MMM");

            if (!topPlayer || !bottomPlayer || !middlePlayer1 || !middlePlayer2) {
                throw new ResponseError(400, "Unable to create teams with available players");
            }

            // Create first team (top + bottom ranked players)
            const team1 : any = await this.matchRepository.createTeam(
                tournament.id,
                TEAM_GENERATED_BY_SYSTEM,
                topPlayer.id,
                bottomPlayer.id,
                tx
            );

            // Create second team (middle ranked players)
            const team2 : any = await this.matchRepository.createTeam(
                tournament.id,
                TEAM_GENERATED_BY_SYSTEM,
                middlePlayer1.id,
                middlePlayer2.id,
                tx
            );

            // Create match with current round and court
            const createMatchDTO: CreateMatchDTO = {
                tournamentId: tournament.id,
                roundNumber: currentRound,
                courtNumber: currentCourt,
                status: MatchStatus.IN_PROGRESS,
            };

            // Update court number, ensuring we use all available courts
            currentCourt = (currentCourt % maxCourts) + 1;

            const createdMatch = await this.matchRepository.create(createMatchDTO, tx);

            // Create match scores
            await this.matchRepository.createMatchScore({
                matchId: createdMatch.id,
                teamId: team1.id,
                score: 0,
            }, tx);

            await this.matchRepository.createMatchScore({
                matchId: createdMatch.id,
                teamId: team2.id,
                score: 0,
            }, tx);

            matches.push(createdMatch);

            // Remove used players from the pool
            playersInMatches.add(topPlayer.id);
            playersInMatches.add(bottomPlayer.id);
            playersInMatches.add(middlePlayer1.id);
            playersInMatches.add(middlePlayer2.id);

            // Remove used players from playerPoints array
            playerPoints.splice(middleIndex, 1); // Remove middlePlayer2
            playerPoints.splice(middleIndex - 1, 1); // Remove middlePlayer1
            playerPoints.pop(); // Remove bottom player
            playerPoints.shift(); // Remove top player
        }

        // Handle remaining players if any (should be less than 4)
        if (playerPoints.length > 0) {
            console.log(`Warning: ${playerPoints.length} players couldn't be matched in this round`);
        }

        return matches;
    }

    private generateMatchesByUnplayedOpponents = async (
        tournament: any,
        latestRoundNumber: number,
        maxCourts: number,
        tx?: Prisma.TransactionClient
    ): Promise<Match[]> => {
        const matches: Match[] = [];
        const currentRound = latestRoundNumber + 1;
        let currentCourt = 1;
        
        // Get unmatched players from previous round
        const unmatchedPlayersFromPrevRound = await this.getUnmatchedPlayersWithTx(tournament.id, latestRoundNumber, tx);
        const priorityPlayerIds = new Set(unmatchedPlayersFromPrevRound.map((p: any) => p.id));
        
        // Available players for this round - prioritize previously unmatched players
        const availablePlayers = new Set(tournament.players.map((p: any) => p.id));
        const playerMap = new Map(tournament.players.map((p: any) => [p.id, p]));

        // Get all previous matches to track who played with whom
        const previousMatches : any = await this.matchRepository.findByTournamentId(tournament.id, tx);
        
        // Track partnerships: who played with whom
        const partnerships = new Map<number, Map<number, number>>();
        // Track oppositions: who played against whom
        const oppositions = new Map<number, Map<number, number>>();

        // Initialize tracking maps for each player
        tournament.players.forEach((player: any) => {
            partnerships.set(player.id, new Map());
            oppositions.set(player.id, new Map());
        });

        // Build history of partnerships and oppositions
        for (const match of previousMatches) {
            console.log(match, "MMM");
            console.log(match.match_scores[0].team, "MMM");
            const teams : any = match.match_scores.map((score: any) => ({
                teamId: score.team_id,
                players: score.team.player_teams.map((pt: any) => pt.player_id)
            }));

            console.log(teams, "MMM");

            if (teams.length !== 2) continue;

            debugger;
            // Record partnerships (teammates)
            teams.forEach((team: any) => {
                if (team.players.length !== 2) return;
                const [p1, p2] = team.players;
                
                partnerships.get(p1)?.set(p2, (partnerships.get(p1)?.get(p2) ?? 0) + 1);
                partnerships.get(p2)?.set(p1, (partnerships.get(p2)?.get(p1) ?? 0) + 1);
            });

            // Record oppositions (opponents)
            const [team1, team2] = teams;
            team1.players.forEach((p1: any) => {
                team2.players.forEach((p2: any) => {
                    oppositions.get(p1)?.set(p2, (oppositions.get(p1)?.get(p2) ?? 0) + 1);
                    oppositions.get(p2)?.set(p1, (oppositions.get(p2)?.get(p1) ?? 0) + 1);
                });
            });
        }

        // Modify the scoring function to prioritize unmatched players
        const getPartnershipScore = (p1: number, p2: number, p3: number, p4: number): number => {
            const baseScore = (
                (partnerships.get(p1)?.get(p2) ?? 0) * 2 +
                (partnerships.get(p3)?.get(p4) ?? 0) * 2 +
                (oppositions.get(p1)?.get(p3) ?? 0) +
                (oppositions.get(p1)?.get(p4) ?? 0) +
                (oppositions.get(p2)?.get(p3) ?? 0) +
                (oppositions.get(p2)?.get(p4) ?? 0)
            );

            // Apply priority scoring - lower score means higher priority
            const priorityBonus = 
                (priorityPlayerIds.has(p1) ? -10 : 0) +
                (priorityPlayerIds.has(p2) ? -10 : 0) +
                (priorityPlayerIds.has(p3) ? -10 : 0) +
                (priorityPlayerIds.has(p4) ? -10 : 0);

            return baseScore + priorityBonus;
        };

        while (availablePlayers.size >= 4) {
            let bestFoursome: number[][] | null = null;
            let bestScore = Infinity;

            const players = Array.from(availablePlayers);
            
            // Try all possible combinations, but prioritize including unmatched players
            for (let i = 0; i < players.length - 3; i++) {
                for (let j = i + 1; j < players.length - 2; j++) {
                    for (let k = j + 1; k < players.length - 1; k++) {
                        for (let l = k + 1; l < players.length; l++) {
                            const p1 = players[i], p2 = players[j], p3 = players[k], p4 = players[l];

                            // Calculate scores for possible team combinations
                            const combinations = [
                                [[p1, p2], [p3, p4]],
                                [[p1, p3], [p2, p4]],
                                [[p1, p4], [p2, p3]]
                            ];

                            combinations.forEach((teams: any) => {
                                const [[t1p1, t1p2], [t2p1, t2p2]] : any = teams;
                                const score = getPartnershipScore(t1p1, t1p2, t2p1, t2p2);

                                if (score < bestScore) {
                                    bestScore = score;
                                    bestFoursome = teams;
                                }
                            });
                        }
                    }
                }
            }

            if (!bestFoursome) break;

            // Create teams and match with the best foursome
            const [[p1, p2], [p3, p4]] : any = bestFoursome;

            // Create teams
            const team1 : any = await this.matchRepository.createTeam(
                tournament.id,
                TEAM_GENERATED_BY_SYSTEM,
                p1,
                p2,
                tx
            );

            const team2 : any = await this.matchRepository.createTeam(
                tournament.id,
                TEAM_GENERATED_BY_SYSTEM,
                p3,
                p4,
                tx
            );

            // Create match with current round and court
            const createMatchDTO: CreateMatchDTO = {
                tournamentId: tournament.id,
                roundNumber: currentRound,
                courtNumber: currentCourt,
                status: MatchStatus.IN_PROGRESS
            };

            // Update court number, ensuring we use all available courts
            currentCourt = (currentCourt % maxCourts) + 1;

            const createdMatch = await this.matchRepository.create(createMatchDTO, tx);

            // Create match scores
            await this.matchRepository.createMatchScore({
                matchId: createdMatch.id,
                teamId: team1.id,
                score: 0
            }, tx);

            await this.matchRepository.createMatchScore({
                matchId: createdMatch.id,
                teamId: team2.id,
                score: 0
            }, tx);

            matches.push(createdMatch);

            // Remove used players from available pool
            [p1, p2, p3, p4].forEach(p => availablePlayers.delete(p));
        }

        // Handle remaining players if any (should be less than 4)
        if (availablePlayers.size > 0) {
            console.log(`Warning: ${availablePlayers.size} players couldn't be matched in this round`);
        }

        return matches;
    }

    public getMatchesByTournament = async (tournamentId: number): Promise<Match[]> => {
        return await this.matchRepository.findByTournamentId(tournamentId);
    }

    public getMatchById = async (id: number): Promise<Match> => {
        const match = await this.matchRepository.findById(id);
        if (!match) {
            throw new ResponseError(404, "Match not found");
        }
        return match;
    }

    // Use more specific type for status
    public updateMatchStatus = async (id: number, status: MatchStatus): Promise<Match> => {
        await this.getMatchById(id);
        return await this.matchRepository.updateStatus(id, status);
    }

    // Add access modifier
    public generateMatchesWithTransaction = async (payload: GenerateNextRoundMatchRequestDTO): Promise<Match[]> => {
        return await this.prismaClient.$transaction(async (tx) => {
            return await this.generateMatches(payload, tx);
        });
    }

    public endMatch = async (payload: EndMatchRequestDTO, tx?: Prisma.TransactionClient): Promise<MatchScore[]> => {
        const match = await this.getMatchById(payload.matchId);
        if (!match) {
            throw new ResponseError(404, "Match not found");
        }

        const matchScores: Array<CreateMatchScoreDTO> = [];
        const matchScoreDTO: CreateMatchScoreDTO = {
            matchId: match.id,
            teamId: payload.teamId,
            score: payload.score,
        };

        const matchScoreDTO2: CreateMatchScoreDTO = {
            matchId: match.id,
            teamId: payload.teamId2,
            score: payload.score2,
        };
        matchScores.push(matchScoreDTO);
        matchScores.push(matchScoreDTO2);

        return await this.matchRepository.createManyMatchScore(matchScores, tx);
    }

    public endMatchWithTransaction = async (payload: EndMatchRequestDTO): Promise<MatchScore[]> => {
        return await this.prismaClient.$transaction(async (tx) => {
            return await this.endMatch(payload, tx);
        });
    }

    public updateMatchScoreBulk = async (payload: UpdateMatchScoreBulkRequestDTO, tx?: Prisma.TransactionClient): Promise<MatchScore[]> => {
        await this.validateUpdateMatchScoreBulkRequestDTO(payload);
        const matchScores = await this.matchRepository.updateManyMatchScore(payload.updates, tx);
        let tournamentId: number;

        for (const matchScore of matchScores) {
            const match: any = await this.matchRepository.findById(matchScore.match_id, tx);
            const updatedMatch: any = {
                id: match.id,
                round_number: match.round_number,
                court_number: match.court_number,
                status: MatchStatus.COMPLETED,
            };

            console.log(updatedMatch, "MMM");
            console.log(match, "MMM");

            await this.matchRepository.save(updatedMatch, tx);
           
        }
        await this.updateLeaderboardForMatch(matchScores[0].match_id, tx);

    
        return matchScores;
    }

    public updateMatchScoreBulkWithTransaction = async (payload: UpdateMatchScoreBulkRequestDTO): Promise<MatchScore[]> => {
        return await this.prismaClient.$transaction(async (tx) => {
            return await this.updateMatchScoreBulk(payload, tx);
        });
    }
    
    private validateUpdateMatchScoreBulkRequestDTO = async (payload: UpdateMatchScoreBulkRequestDTO): Promise<void> => {
        validate(updateMatchScoreBulkValidation, payload);

        for (const update of payload.updates) {
            if (update.score < 0) {
                throw new ResponseError(400, "Score cannot be less than 0");
            }
            const matchScore = await this.matchRepository.findMatchScoreById(update.matchScoreId);
            if (!matchScore) {
                throw new ResponseError(404, `Match score with id ${update.matchScoreId} not found`);
            }
        }
    }


    private updateLeaderboardForMatch = async (matchId: number, tx?: Prisma.TransactionClient): Promise<void> => {
        const match: any = await this.matchRepository.findById(matchId, tx);
        
        if (!match) {
            throw new ResponseError(404, "Match not found");
        }
        const matchScores: MatchScore[] = await this.matchRepository.findMatchScoreByMatchId(matchId, tx);
        if (matchScores.length !== 2) {
            throw new ResponseError(400, "Match score is not valid");
        }


        const winningScore : any = matchScores[0].score > matchScores[1].score ? matchScores[0] : matchScores[1];
        const losingScore : any = matchScores[0].score < matchScores[1].score ? matchScores[0] : matchScores[1];

        const pointWin: number = match.tournament.type === GAME_TYPES.MEXICANO || match.tournament.type === GAME_TYPES.MIXICANO || match.tournament.type === GAME_TYPES.TEAM_MIXICANO ? 3 : winningScore.score;

        const winningTeam = winningScore.team;
        const losingTeam = losingScore.team;

        const winningTeamPlayers = winningTeam.player_teams.map((pt: any) => pt.player);
        const losingTeamPlayers = losingTeam.player_teams.map((pt: any) => pt.player);

        const leaderboardEntries: Leaderboard[] = await this.leaderboardRepository.findByTournamentId(match.tournament_id, tx);

        for (const player of winningTeamPlayers) {
            const leaderboardEntry = leaderboardEntries.find(l => l.player_id === player.id);
            
            if (leaderboardEntry) {
                leaderboardEntry.matches_won = leaderboardEntry.matches_won + 1; 
                leaderboardEntry.points = leaderboardEntry.points + pointWin;
                leaderboardEntry.matches_played = leaderboardEntry.matches_played + 1;
                await this.leaderboardRepository.save(leaderboardEntry, tx);
            } else {
                
                const leaderboard: any = {
                    player_id: player.id,
                    points: pointWin,
                    matches_won: 1,
                    matches_lost: 0,
                    matches_draw: 0,
                    tournament_id: match.tournament_id,
                    matches_played: 1
                };
                await this.leaderboardRepository.save(leaderboard, tx);
            }

        }

        for (const player of losingTeamPlayers) {
            const leaderboardEntry = leaderboardEntries.find(l => l.player_id === player.id);
            if (leaderboardEntry) {
                leaderboardEntry.matches_lost = leaderboardEntry.matches_lost + 1;
                leaderboardEntry.matches_played = leaderboardEntry.matches_played + 1;
                await this.leaderboardRepository.save(leaderboardEntry, tx);
            } else {
                const leaderboardEntry: any = {
                    player_id: player.id,
                    points: 0,
                    matches_won: 0,
                    matches_lost: 1,
                    matches_draw: 0,
                    tournament_id: match.tournament_id,
                    matches_played: 1
                };
                await this.leaderboardRepository.save(leaderboardEntry, tx);
            }
        }
    }

    public getUnmatchedPlayersWithTx = async (tournamentId: number, roundNumber: number, tx?: Prisma.TransactionClient): Promise<Player[]> => {
        const tournament = await this.tournamentRepository.findById(tournamentId, tx);
        if (!tournament) {
            throw new ResponseError(404, `Tournament with ID ${tournamentId} not found`);
        }

        // Get all players in tournament
        const allPlayers = new Set(tournament.players.map((p: any) => p.id));
        
        // Get matches for this specific round
        const roundMatches: any = await this.matchRepository.findByTournamentIdAndRound(tournamentId, roundNumber, tx);
        const playedPlayerIds = new Set<number>();
        
        // Collect all players who played in this round
        for (const match of roundMatches) {
            for (const score of match.match_scores) {
                const playerTeams = score.team.player_teams;
                playerTeams.forEach((pt: any) => playedPlayerIds.add(pt.player_id));
            }
        }
        
        // Find players who haven't played
        const unmatchedPlayerIds = Array.from(allPlayers).filter((id: any) => !playedPlayerIds.has(id));
        
        // Get full player details for unmatched players
        const unmatchedPlayers = tournament.players.filter((player: any) => unmatchedPlayerIds.includes(player.id));
        
        return unmatchedPlayers;
    }
    // Get unmatched players for a specific round
    public getUnmatchedPlayers = async (tournamentId: number, roundNumber: number): Promise<Player[]> => {
        const tournament = await this.tournamentRepository.findById(tournamentId);
        if (!tournament) {
            throw new ResponseError(404, `Tournament with ID ${tournamentId} not found`);
        }

        // Get all players in tournament
        const allPlayers = new Set(tournament.players.map((p: any) => p.id));
        
        // Get matches for this specific round
        const roundMatches: any = await this.matchRepository.findByTournamentIdAndRound(tournamentId, roundNumber);
        const playedPlayerIds = new Set<number>();
        
        // Collect all players who played in this round
        for (const match of roundMatches) {
            for (const score of match.match_scores) {
                const playerTeams = score.team.player_teams;
                playerTeams.forEach((pt: any) => playedPlayerIds.add(pt.player_id));
            }
        }
        
        // Find players who haven't played
        const unmatchedPlayerIds = Array.from(allPlayers).filter((id: any) => !playedPlayerIds.has(id));
        
        // Get full player details for unmatched players
        const unmatchedPlayers = tournament.players.filter((player: any) => unmatchedPlayerIds.includes(player.id));
        
        return unmatchedPlayers;
    }
} 
