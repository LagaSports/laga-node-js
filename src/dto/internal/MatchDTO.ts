import { CreateMatchScoreDTO } from "./CreateMatchScoreDTO.js";
import { TeamDTO } from "./TeamDTO.js";

export type MatchDTO = {
    id: number;
    round: number
    matchScores: CreateMatchScoreDTO[];
    courtNumber: number;

}     