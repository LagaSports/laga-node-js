import { PlayerDTO } from "../internal/PlayerDTO.js";

// What the API receives (camelCase - JSON convention)
export type CreateTournamentRequestDTO = {
    name: string;
    type: string;
    pointsToPlay: number;
    creatorId: number;
    numberOfCourt: number;
    padelCourtId: number;
    players: Array<PlayerDTO>;
} 