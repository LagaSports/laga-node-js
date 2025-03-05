import { MatchDTO } from "./MatchDTO.js";
import { PlayerDTO } from "./PlayerDTO.js";

export type TournamentDTO = {
    id: number;
    name: string;
    creatorId: number;
    players: PlayerDTO[];
    pointsToPlay: number;
    type: string;
    numberOfCourt: number;
    matches: MatchDTO[];
    location: {
        name: string;
        googleMapsLink: string;
        description: string;
        googlePlaceId: string;
    } | null;
}

export type LeaderboardDTO = {
    id: number;
    tournamentId: number;
    playerName: string;
    playerWin: number;
    playerLoss: number;
    playerDraw: number;
    playerPoints: number;
    playerDifference: number;
}

export const GAME_TYPES = {
    CHAMPIONSHIP: 'Championship',
    AMERICANO: 'Americano',
    MIX_AMERICANO: 'Mix Americano',
    MEXICANO: 'Mexicano',
    MIXICANO: 'Mixicano',
    TEAM_MIXICANO: 'Team Mixicano'
};

export const GAME_TYPES_LIST = [
    GAME_TYPES.CHAMPIONSHIP,
    GAME_TYPES.AMERICANO,
    GAME_TYPES.MIX_AMERICANO,
    GAME_TYPES.MEXICANO,
    GAME_TYPES.MIXICANO,
    GAME_TYPES.TEAM_MIXICANO
];

export type RecentTournamentDTO = {
    id: Number,
    name: String,
    location: String,
    numberOfCourt: Number,
    numberOfPlayers: Number,
}