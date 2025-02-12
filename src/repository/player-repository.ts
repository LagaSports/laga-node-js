import { Player, PrismaClient, Prisma } from "@prisma/client";
import { PlayerDTO } from "../dto/internal/PlayerDTO.js";
import { CreatePlayerDTO } from "../dto/internal/CreatePlayerDTO.js";

export class PlayerRepository {

    constructor(
        private prismaClient: PrismaClient,
    ) {}

    create = async (payload: CreatePlayerDTO, tx?: Prisma.TransactionClient): Promise<Player> => {
        const player = await (tx ?? this.prismaClient).player.create({
            data: payload,
        });
        return player;
    }

    createMany = async (payload: Array<CreatePlayerDTO>, tx?: Prisma.TransactionClient): Promise<Array<Player>> => {
        const players = await (tx ?? this.prismaClient).player.createManyAndReturn({
            data: payload,
        });
        return players;
    }

    findById = async (id: number, tx?: Prisma.TransactionClient): Promise<Player | null> => {
        return await (tx ?? this.prismaClient).player.findUnique({
            where: {
                id: id,
            },
        });
    }
}