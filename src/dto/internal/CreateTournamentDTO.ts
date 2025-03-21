// Internal DTO (snake_case - matches database)
export type CreateTournamentDTO = {
    name: string;
    type: string;
    points_to_play: number;
    creator_id: number;
    number_of_court: number;
    tournament_address_id: number;
} 