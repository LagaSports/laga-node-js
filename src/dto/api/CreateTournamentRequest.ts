// What the API receives (camelCase - JSON convention)
export type CreateTournamentRequest = {
    name: string;
    type: string;
    pointsToPlay: number;
    creatorId: number;
} 