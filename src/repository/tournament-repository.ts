import { PrismaClient, Tournament } from "@prisma/client";
import { CreateTournamentDTO } from "../dto/internal/CreateTournamentDTO.js";

export class TournamentRepository {

    constructor(
        private prismaClient: PrismaClient,
    ) {}

    create = async (payload: CreateTournamentDTO): Promise<Tournament> => {
        const tournament = await this.prismaClient.tournament.create({
            data: payload,
        });
        return tournament;
    }


}