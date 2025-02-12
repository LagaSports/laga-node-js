export type UpdateMatchScoreDTO = {
    matchScoreId: number;
    score: number;
}

export type UpdateMatchScoreBulkRequestDTO = {
    updates: UpdateMatchScoreDTO[];
}