import { PlayerDTO } from "./PlayerDTO.js";

export type TeamDTO = {
    id: number;
    name: string;
    players: PlayerDTO[];
}