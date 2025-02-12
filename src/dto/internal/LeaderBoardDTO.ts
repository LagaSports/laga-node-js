export type LeaderBoardDTO = {
    playerId: number | null;
    playerName: string | null;
    teamId: number | null;
    teamName: string | null;
    points: number;
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    matchesDraw: number;
}